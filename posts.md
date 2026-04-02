---
layout: default
permalink: /posts/
title: Writing
---

<div class="posts-archive">
  <div class="container">
    <header class="page-header reveal">
      <h1 class="page-title">Writing</h1>
    </header>
    <div class="posts-archive-list">
      {% for post in site.posts %}
      <a href="{{ post.url | prepend: site.baseurl }}" class="post-item reveal">
        <div class="post-item-meta">{{ post.date | date: '%b %d, %Y' }}</div>
        <div>
          <h3 class="post-item-title">{{ post.title }}</h3>
          <p class="post-item-excerpt">{{ post.excerpt | strip_html | truncatewords: 22 }}</p>
        </div>
        <span class="post-item-link">Read &rarr;</span>
      </a>
      {% endfor %}
    </div>
  </div>
</div>
