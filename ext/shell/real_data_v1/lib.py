import os, json, csv
from IPython.display import HTML

def init_real_data_v1():
  '''
    - Fills the system by real data to test the interface by real users.
  '''
  data_dir = os.path.dirname(os.path.realpath(__file__))
  print 'The process "init_real_data_v1" has been started.'
  print 'path - %s' % data_dir

  # Tag creation.
  with open(os.path.join(data_dir, 'tags.json')) as json_file:
    tags = json.load(json_file)

  flat_tags = {}

  def go_over(tags, parent=None):
    for tag_name, tag in tags.items():
      parent_id = parent['obj']['id'] if parent else None
      flat_tags[tag_name] = tag
      if '_' in tag:
        go_over(tag['_'], parent)

  go_over(tags)
  expenses = []
  with open(os.path.join(data_dir, 'expenses.csv')) as csv_file:
    reader = csv.reader(csv_file)
    for row in reader:
      tag_list = row[2]
      # @todo - pass expenses expenses.
      expenses.append([row[0], row[1], row[2]])

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

