import os
import datetime
import json
import pprint
import numpy as np

import jinja2

from github import Github

BAD_LABELS = set(['investigating', 'degraded performance', 'major outage'])
OLDEST = datetime.datetime.utcnow() - datetime.timedelta(days=90)
TIME_FMT = '%Y/%m/%d %H:%M:%S'

gh = Github(os.environ['GITHUB_TOKEN'])
repo = gh.get_repo('conda-forge/status')

labels = [
    repo.get_label(n)
    for n in BAD_LABELS]
issues = repo.get_issues(state='all')

current_status = set()

open_issues = []
closed_issues = []

for issue in issues:
    lnames = set(l.name for l in issue.labels)
    if lnames & BAD_LABELS:
        if issue.state == 'open':
            current_status |= (lnames & BAD_LABELS)
            open_issues.append({
                'title': issue.title,
                'id': int(issue.number),
                'url': issue.url,
                'severity': list((lnames & BAD_LABELS))[0],
                'state': open,
                'time': issue.updated_at.strftime(TIME_FMT),
                'epoch': issue.updated_at.timestamp(),
                'body': issue.body})
        else:
            if issue.closed_at > OLDEST:
                closed_issues.append({
                    'title': issue.title,
                    'id': int(issue.number),
                    'url': issue.url,
                    'severity': list((lnames & BAD_LABELS))[0],
                    'state': 'closed',
                    'time': issue.closed_at.strftime(TIME_FMT),
                    'epoch': issue.closed_at.timestamp(),
                    'body': issue.body})

epochs = np.array([iss['epoch'] for iss in closed_issues])
inds = np.argsort(epochs)[::-1]
closed_issues = [closed_issues[i] for i in inds]

# compute status
if not current_status:
    current_status = 'operational'
else:
    if 'major outage' in current_status:
        current_status = 'major outage'
    elif 'degraded performance' in current_status:
        current_status = 'degraded performance'
    elif 'investigating' in current_status:
        current_status = 'investigating'
    else:
        raise ValueError('we did not find a total status!')

print("current status:", current_status)
print("open issues:\n" + pprint.pformat(open_issues))
print("closed issues:\n" + pprint.pformat(closed_issues))

# render it
with open('template.html', 'r') as fp:
    template = jinja2.Template(fp.read())

with open('config.json', 'r') as fp:
    config = json.load(fp)

page = template.render(
    config=config,
    current_status=current_status,
    open_issues=open_issues,
    closed_issues=closed_issues)

with open('index.html', 'w') as fp:
    fp.write(page)
