---
weight: 0
category: Data and API
published: true
title: The Loveland Parcel Schema
permalink: /articles/schema
layout: wider_content
---

We clean and convert all parcel data we recieve into this standard schema. Some counties may include additional fields. Wherever possible, we include those in our exports, but we do not have a key available for those fields. Each tier includes all of the fields in any tiers below it.

<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Description</th>
      <th>Tier</th>
      <th>Datatype</th>
    </tr>
  </thead>
  <tbody>
  {% for field in site.data.schema.schema %}
    <tr>
      <td class="code"><a name="{{field[0]}}">{{field[0]}}</a></td>
      <td>
        {{field[1].human}}
        {% if field[1].examples %}<p>Examples: {{field[1].examples | join: ", " }}</p>{% endif %}
      </td>
      <td>{{field[1].tier}}</td>
      <td class="code">{{field[1].type}}</td>
    </tr>
  {% endfor %}
  </tbody>
</table>
