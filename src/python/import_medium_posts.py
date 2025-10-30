#!/usr/bin/env python3
"""Import Medium posts as external blog entries."""
from __future__ import annotations

import argparse
import datetime as dt
import html
import re
import sys
import unicodedata
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

DEFAULT_FEED_URL = "https://medium.com/feed/@dave1010"
EXTERNAL_SOURCE_KEY = "medium"
EXTERNAL_SOURCE_LABEL = "Medium"
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"


def fetch_feed(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request) as response:  # nosec B310 - feed is configured by repo owners
        return response.read()


def normalise_slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "post"


def strip_html(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def parse_date(raw: str) -> dt.date:
    parsed = parsedate_to_datetime(raw)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc).date()


def get_excerpt(description: str, fallback: str | None = None) -> str:
    text = strip_html(description) if description else ""
    if not text and fallback:
        text = strip_html(fallback)
    return text.strip()


def iter_items(feed: ET.Element) -> Iterable[dict[str, object]]:
    channel = feed.find("channel")
    if channel is None:
        return []

    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        guid = (item.findtext("guid") or link).strip()
        pub_date = item.findtext("pubDate")
        categories = [cat.text.strip() for cat in item.findall("category") if cat.text]
        description = item.findtext("description") or ""
        content_node = item.find(f"{CONTENT_NS}encoded")
        content_html = content_node.text if content_node is not None and content_node.text else None

        if not title or not link or not pub_date:
            continue

        try:
            date = parse_date(pub_date)
        except (TypeError, ValueError):
            continue

        excerpt = get_excerpt(description, fallback=content_html)
        yield {
            "title": title,
            "link": link,
            "guid": guid or link,
            "date": date,
            "tags": sorted(set(categories), key=str.lower),
            "excerpt": excerpt,
        }


def derive_slug(link: str, guid: str | None, title: str) -> str:
    """Choose a deterministic slug for a Medium post."""

    parsed = urlparse(link)
    path_segment = ""
    if parsed.path:
        # ``split`` keeps empty segments; filter them so ``/foo/`` works
        parts = [part for part in parsed.path.split("/") if part]
        if parts:
            path_segment = parts[-1]

    if path_segment and path_segment.lower() != "index":
        slug = normalise_slug(path_segment)
        if slug and slug != "post":
            return slug

    if guid:
        slug = normalise_slug(guid)
        if slug and slug != "post":
            return slug

    return normalise_slug(title)


def write_post(base_dir: Path, data: dict[str, object], overwrite: bool = False) -> Path:
    title = str(data["title"])
    link = str(data["link"])
    guid = str(data["guid"])
    date = data["date"]
    tags = list(data.get("tags", []))
    excerpt = str(data.get("excerpt", "")).strip()

    year_dir = base_dir / f"{date.year:04d}"
    year_dir.mkdir(parents=True, exist_ok=True)

    slug = derive_slug(link, guid, title)
    destination = year_dir / f"{slug}.md"
    if destination.exists() and not overwrite:
        return destination

    lines = ["---"]
    escaped_title = title.replace("\\", "\\\\").replace('"', '\\"')
    lines.append(f"title: \"{escaped_title}\"")
    lines.append(f"date: {date.isoformat()}")
    lines.append("type: external")
    lines.append(f"externalUrl: {link}")
    lines.append(f"externalSource: {EXTERNAL_SOURCE_KEY}")
    lines.append(f"guid: {guid}")
    if tags:
        lines.append("tags:")
        for tag in tags:
            lines.append(f"  - {tag}")
    else:
        lines.append("tags: []")
    if excerpt:
        lines.append("excerpt: >-")
        lines.append(f"  {excerpt}")
    else:
        lines.append("excerpt: ''")
    lines.append("---")
    lines.append("")
    lines.append(
        f"> Read the full article on {EXTERNAL_SOURCE_LABEL}: [{title}]({link})."
    )
    content = "\n".join(lines) + "\n"
    destination.write_text(content, encoding="utf-8")
    return destination


def import_medium_posts(feed_url: str, output: Path, overwrite: bool = False) -> list[Path]:
    try:
        raw = fetch_feed(feed_url)
    except HTTPError as exc:  # pragma: no cover - network failures reported to caller
        print(f"Failed to fetch feed: {exc}", file=sys.stderr)
        raise

    feed = ET.fromstring(raw)
    created: list[Path] = []
    for item in iter_items(feed):
        path = write_post(output, item, overwrite=overwrite)
        created.append(path)
    return created


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", nargs="?", type=Path, default=Path("content/blog/posts/external"))
    parser.add_argument("--feed-url", dest="feed_url", default=DEFAULT_FEED_URL, help="Medium RSS feed URL")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing markdown files")
    args = parser.parse_args()

    created = import_medium_posts(args.feed_url, args.output, overwrite=args.overwrite)
    for path in created:
        print(path)


if __name__ == "__main__":
    main()
