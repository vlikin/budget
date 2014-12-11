from copy import deepcopy
from datetime import datetime
from IPython.display import HTML

import csv
import json
import pdb

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


def calculate_tag_capacity(tag_name, tag):
  '''
    - It calculates a capacity of the tag, volumes of all inside tags.
  '''
  if 'volume' not in tag:
    tag['volume'] = 0
    tag['expenses'] = list()

  capacity = tag['volume']
  if '_' in tag:
    for inside_tag_name, inside_tag in tag['_'].iteritems():
      if '_' not in tag or len(tag['_']) == 0:
        capacity = capacity + inside_tag['volume']
      else:
        capacity = capacity + calculate_tag_capacity(inside_tag_name, inside_tag)
  tag['capacity'] = capacity

  return capacity

def calculate_tags_capacity(tags):
  '''
    - It calculates capacities of all tags.
  '''
  for tag_name, tag in tags.iteritems():
    calculate_tag_capacity(tag_name, tag)

def attach_expenses2tags(expenses, tags):
  '''
    - It attaches expenses to tags, it sets a tag volume.
  '''
  if type(tags) is dict:
    flat_tags = get_flat_tags(tags)
  elif type(tags) is list:
    flat_tags = tags

  for expense in expenses:
    for tag_name in expense[2]:
      tag = flat_tags[tag_name]
      if 'expenses' not in tag:
        tag['expenses'] = list()
      if 'volume' not in tag:
        tag['volume'] = 0

      tag['expenses'].append(expense)
      tag['volume'] = tag['volume'] + expense[1]


def load_expenses(path):
  '''
    - It loads expenses from a file.
  '''
  expenses = []
  with open(path) as csv_file:
    reader = csv.reader(csv_file)
    for row in reader:
      date = datetime.strptime(row[0], '%d.%m.%Y')
      value = float(row[1])
      tag_list = [ s.strip() for s in row[2].split(',') ]
      expense = [date, value, tag_list]
      expenses.append(expense)

  return expenses

def load_tags(path):
  '''
    - It loads tags from a JSON file.
  '''
  with open(path) as json_file:
    tags = json.load(json_file)

  return tags

def get_flat_tags(tags):
  '''
    - It Moves a tree hierarchy into a flat list.
  '''
  scope = dict(
    flat_tags=dict()
  )
  __go_over(__get_flat_tags_callback, tags, (None, None), scope)

  return scope['flat_tags']

def prepare_tags(loaded_tags):
  '''
    - It prepares the loaded tags.

    It copies the loaded tags and attaches additional
    data that helps for calculations.
  '''
  tags = deepcopy(loaded_tags)
  __go_over(__back_link_callback, tags)
  __go_over(__calculate_level_callback, tags)

  return tags

def __go_over(callback, tags, parent_kv=(None, None), scope=None):
  '''
    - It goes through the tags and call the callback.
  '''
  parent_tag_name, parent_tag = parent_kv
  for tag_name, tag in tags.items():
    callback((tag_name, tag), parent_kv, scope)
    if '_' in tag:
      __go_over(callback, tag['_'], (tag_name, tag), scope)

def __get_flat_tags_callback(tag_kv, parent_kv, scope):
  '''
    - The callback that set a level for the current tag.
  '''
  tag_name, tag = tag_kv
  scope['flat_tags'][tag_name] = tag

def __calculate_level_callback(tag_kv, parent_kv, scope):
  '''
    - The callback that set a level for the current tag.
  '''
  tag_name, tag = tag_kv
  parent_name, parent = parent_kv
  if not tag['parent'][0]:
    tag['level'] = 0
  else:
    if 'level' not in tag['parent'][1]:
      tag['parent'][1]['level'] = 0
    tag['level'] = tag['parent'][1]['level'] + 1

def __back_link_callback(tag_kv, parent_kv, scope=None):
  '''
    - The callback that set a level for the current tag.
  '''
  tag_name, tag = tag_kv
  parent_name, parent = parent_kv
  tag['parent'] = parent_kv
