from copy import deepcopy

import json
import pdb

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
