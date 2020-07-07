import isEqual from 'lodash/isEqual';
import { State } from 'arca-redux-v4';
import { tree } from '../types/index';

const isKeyWithDash = (key: string) => key.includes('-');

const setItemToParent = (parentList: tree[], item: State['Source']['AAU-Concretize'][0]) => {
  const itemKey = item.Key.split('.');

  if (parentList.length) {
    parentList.every(parent => {
      const parentKey = parent.Key.split('.');
      const isSetInTree = item.Key.includes(parent.Key) && parent.Expand;

      if (isSetInTree) {
        if (itemKey.length - parentKey.length === 1) {
          parent.items.push({
            ...item,
            ...(item.Expand ? { items: [] } : {}),
          });
        } else {
          setItemToParent(parent.items, item);
        }
        return false;
      }

      return true;
    });
  } else {
    parentList.push({
      ...item,
      ...(item.Expand ? { items: [] } : {}),
    });
  }
};

export const parseTreeItems = (items: State['Source']['AAU-Concretize']): tree[][] => items
  .reduce((filteredItems, item) => {
    const itemNotExist = !filteredItems.some(filteredItem => isEqual(filteredItem, item));

    if (itemNotExist) {
      filteredItems.push(item);
    }

    return filteredItems;
  }, [] as State['Source']['AAU-Concretize'])
  .sort((firstItem, secondItem) => {
    const firstKey = firstItem.Key.split('.');
    const secondKey = secondItem.Key.split('.');

    return firstKey.length - secondKey.length;
  })
  .reduce((acc, item) => {
    if (!acc[1].length) {
      acc[1].push({
        Key: '-.',
        Expand: true,
      });
    }

    if (isKeyWithDash(item.Key)) {
      acc[1].push(item);
    } else {
      acc[0].push(item);
    }

    return acc;
  }, [[], []])
  .map(
    tree => tree
      .reduce((list, item) => {
        setItemToParent(list, item);

        return list;
      }, [] as tree[]),
  );
