#!/usr/bin/env python3
"""Import Today I Learned posts from the legacy repository."""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
from pathlib import Path
from typing import Iterable


DATE_PREFIX = re.compile(r"^\d{4}-\d{2}-\d{2}-")
HEADING_RE = re.compile(r"^#\s*(?P<title>.+?)\s*$")


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def iter_markdown_files(root: Path) -> Iterable[tuple[str, Path]]:
    for category in sorted(root.iterdir()):
        if not category.is_dir() or category.name.startswith("_"):
            continue
        for path in sorted(category.glob("*.md")):
            yield category.name, path


def creation_date(repo_root: Path, rel_path: Path) -> dt.date:
    result = subprocess.run(
        [
            "git",
            "log",
            "--follow",
            "--format=%ad",
            "--date=iso-strict",
            "--",
            str(rel_path),
        ],
        cwd=repo_root,
        check=True,
        capture_output=True,
        text=True,
    )
    lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if not lines:
        raise RuntimeError(f"Could not determine creation date for {rel_path}")
    created = dt.datetime.fromisoformat(lines[-1])
    return created.date()


def parse_title_and_body(path: Path) -> tuple[str, str]:
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()

    title: str | None = None
    body_lines: list[str] = []

    i = 0
    while i < len(lines):
        line = lines[i]
        if title is None:
            match = HEADING_RE.match(line)
            if match:
                title = match.group("title").strip()
                i += 1
                # Skip a single blank line immediately after the heading
                if i < len(lines) and lines[i].strip() == "":
                    i += 1
                continue
        body_lines.append(line)
        i += 1

    if title is None:
        title = path.stem.replace("-", " ").strip().title()

    while body_lines and body_lines[0].strip() == "":
        body_lines.pop(0)
    while body_lines and body_lines[-1].strip() == "":
        body_lines.pop()

    body = "\n".join(body_lines)
    if body:
        body += "\n"

    return title, body


def import_tils(source: Path, target: Path) -> list[Path]:
    created_files: list[Path] = []
    for category, path in iter_markdown_files(source):
        slug = path.stem
        if DATE_PREFIX.match(slug):
            continue

        rel_path = path.relative_to(source)
        date = creation_date(source, rel_path)
        year_dir = target / f"{date.year:04d}" / f"{date.month:02d}"
        year_dir.mkdir(parents=True, exist_ok=True)

        destination = year_dir / f"{slug}.md"
        if destination.exists():
            raise FileExistsError(f"Destination already exists: {destination}")

        title, body = parse_title_and_body(path)
        front_matter = [
            "---",
            f"title: {yaml_quote(title)}",
            f"date: {date.isoformat()}",
            "tags:",
            f"  - {category}",
            "type: til",
            "---",
            "",
        ]

        destination.write_text("\n".join(front_matter) + body, encoding="utf-8")
        created_files.append(destination)
    return created_files


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to the legacy TIL repository")
    parser.add_argument(
        "target",
        type=Path,
        default=Path("content/blog/posts"),
        nargs="?",
        help="Destination directory for imported posts",
    )
    args = parser.parse_args()

    created = import_tils(args.source, args.target)
    for path in created:
        print(path)


if __name__ == "__main__":
    main()
