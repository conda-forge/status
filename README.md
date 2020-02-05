# status page for conda-forge

the [status page](https://conda-forge.org/status/) for conda-forge

## usage

To make an incident, open an issue and label it with one of

  - investigating
  - degraded performance
  - major outage

Then GitHub Actions will update the page with the issue title and the
text of the issue body.

When the incident is resolved, close the issue and the status page will
return to normal.

## editing the page

When editing the page, edit the `template.html` file. Then run

```bash
$ python render_page.py
```

to inspect the page.

You must render the page before merging a PR!
