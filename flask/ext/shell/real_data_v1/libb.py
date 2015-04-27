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

  def calculate_level_callback(tag_name, tag, scope):
    '''
    '''
    if not tag['parent']:
      tag['level'] = 0
    else:
      if 'level' not in tag['parent']:
        tag['parent']['level'] = 0
      tag['level'] = tag['parent']['level'] + 1

  go_over(calculate_level_callback, tags)

  def flat_tags_callback(tag_name, tag, flat_tags):
    flat_tags[tag_name] = tag
    flat_tags[tag_name]['expenses'] = list()
    flat_tags[tag_name]['volume'] = 0

  go_over(flat_tags_callback, tags, None, flat_tags)

  # It fills expenses.
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

  # It calculates capacities of groups.
  def calculate_capacity(tag_name, tag):
    capacity = tag['volume']
    if '_' in tag:
      for inside_tag_name, inside_tag in tag['_'].iteritems():
        if '_' not in tag or len(tag['_']) == 0:
          capacity = capacity + inside_tag['volume']
        else:
          capacity = capacity + calculate_capacity(inside_tag_name, inside_tag)
    tag['capacity'] = capacity
    return capacity

  for tag_name, tag in tags.iteritems():
    calculate_capacity(tag_name, tag)

  return dict(
    tags=tags,
    flat_tags=flat_tags,
    expenses=expenses
  )

def go_over(callback, tags, parent=None, scope=None):
  for tag_name, tag in tags.items():
    tag['parent'] = parent
    callback(tag_name, tag, scope)
    if '_' in tag:
      go_over(callback, tag['_'], tag, scope)


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

