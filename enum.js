function Enum(keys = '') {
  let props = keys.split(',');
  let _enum = {};
  props.forEach(
    (key, idx) => (_enum[(_enum[key.trim()] = idx + 1)] = key.trim()),
  );
  return _enum;
}

export { Enum };
