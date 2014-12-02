import json

def load_tags(path):

  # Tag creation.
  with open(path) as json_file:
    tags = json.load(json_file)


  def back_link_callback(tag_kv, parent_kv, scope=None):
    print '---> 11'
    tag_name, tag = tag_kv
    parent_name, parent = parent_kv
    tag['parent'] = parent_kv

  go_over(back_link_callback, tags)

  def calculate_level_callback(tag_kv, parent_kv, scope):
    tag_name, tag = tag_kv
    parent_name, parent = parent_kv
    if not tag['parent']:
      tag['level'] = 0
    else:
      if 'level' not in tag['parent'][1]:
        tag['parent'][1]['level'] = 0
      tag['level'] = tag['parent'][1]['level'] + 1

  go_over(calculate_level_callback, tags)

  return tags


def go_over(callback, tags, parent_kv=(None, None), scope=None):
  parent_tag_name, parent_tag = parent_kv
  for tag_name, tag in tags.items():
    callback((tag_name, tag), parent_kv, scope)
    if '_' in tag:
      go_over(callback, tag['_'], (tag_name, tag), scope)