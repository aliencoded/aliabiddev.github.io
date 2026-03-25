---
layout: page
permalink: /posts/
pageOrder: 1
title: "All Posts"
---

<h1>All Posts</h1>

<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a> — {{ post.date | date: "%b %-d, %Y" }}
  </li>
{% endfor %}
</ul>