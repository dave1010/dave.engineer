---
layout: page.njk
sectionLabel: "Connect"
title: "Contact"
description: "Where to find me and how to get in touch."
---

The quickest way to reach me is through social platforms. I keep an eye on these channels for messages and project inquiries.

{% if social %}
- {% for link in social %}[{{ link.label }}]({{ link.href }}){% if not loop.last %}
- {% endif %}{% endfor %}
{% endif %}

If you’re reporting a security issue, please see the security policy at [/.well-known/security.txt](/.well-known/security.txt).
