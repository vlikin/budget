import os, json, csv
from IPython.display import HTML

def init_real_data_v1():
  '''
    - Fills the system by real data to test the interface by real users.
  '''
  data_dir = os.path.dirname(os.path.realpath(__file__))

  # Tag creation.
  with open(os.path.join(data_dir, 'tags.json')) as json_file:
    tags = json.load(json_file)

  flat_tags = {}

  def go_over(tags, parent=None):
    for tag_name, tag in tags.items():
      parent_id = parent['obj']['id'] if parent else None
      flat_tags[tag_name] = tag
      flat_tags[tag_name]['expenses'] = list()
      flat_tags[tag_name]['volume'] = 0
      if '_' in tag:
        go_over(tag['_'], parent)

  go_over(tags)
  expenses = []
  with open(os.path.join(data_dir, 'expenses.csv')) as csv_file:
    reader = csv.reader(csv_file)
    for row in reader:
      tag_list = [ s.strip() for s in row[2].split(',') ]
      expense = [row[0], row[1], tag_list]
      expenses.append(expense)
      for tag in tag_list: 
        flat_tags[tag]['volume'] = flat_tags[tag]['volume'] + float(expense[1].replace(',', '.')) 
        flat_tags[tag]['expenses'].append(expense)

  return dict(
    tags=tags,
    flat_tags=flat_tags,
    expenses=expenses
  )


def display_tree(tags):
  '''
    - It renders HTML tree view of tags.
  '''
  if type(tags) is dict and tags.has_key('_'):
    tags = tags['_']

  def go_over(tags, parent=None):
    '''
      - It goes over a tag tree.
    '''
    html = ''
    for tag_name, tag in tags.items():
      html_item = '<li><span>%s</span>' % tag_name
      if '_' in tag:
        html_inside = go_over(tag['_'], tag)
        html_item = '%s<ul>%s</ul>' % (html_item, html_inside)
      html_item = '%s</li>' % html_item
      html = '%s%s' % (html, html_item)

    return html

  return HTML(go_over(tags))

