import { State } from 'arca-redux-v4';
import { tree } from '../types/index';

export const isKeyWithDash = (key: string) => key.includes('-');

const setItemToParent = (parentList: tree[], item: tree) => {
  if (parentList.length) {
    parentList.forEach(parent => {
      const isSetInTree = item.abstractKey.includes(parent.abstractKey) && parent.Expand;

      if (isSetInTree) {
        if (item.abstractParent === parent.abstractKey) {
          parent.items.push({
            ...item,
            ...(item.Expand ? { items: [] } : {}),
          });
        } else {
          setItemToParent(parent.items, item);
        }
      }
    });
  } else {
    parentList.push({
      ...item,
      ...(item.Expand ? { items: [] } : {}),
    });
  }
};

const compareKeys = (firstItem: tree, secondItem: tree): number => {
  if (!firstItem.Parent) return -1;
  if (!secondItem.Parent) return 1;

  const firstKey = firstItem.abstractKey.slice(2).split('.');
  const secondKey = secondItem.abstractKey.slice(2).split('.');
  const shorterKey = firstKey.length > secondKey.length ? secondKey : firstKey;

  for (let i = 0; i < shorterKey.length; i += 1) {
    const diffValue = Number(firstKey[i]) - Number(secondKey[i]);

    if (diffValue !== 0) {
      return diffValue;
    }
  }

  return firstKey.length - secondKey.length;
};

export const parseTreeItems = (items: State['Source']['AAU-Concretize']): tree[] => items
  .map(item => ({
    ...item,
    abstractKey: item.Key ? item.Key.replace(/^[0-9]+/, '-') : null,
    abstractParent: item.Parent ? item.Parent.replace(/^[0-9]+/, '-') : null,
  }))
  .sort(compareKeys)
  .reduce((list, item) => {
    setItemToParent(list, item);

    return list;
  }, [] as tree[]);
