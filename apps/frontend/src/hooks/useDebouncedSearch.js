Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebouncedSearch = useDebouncedSearch;
const react_1 = require("react");
function useDebouncedSearch(initialValue, delay = 300) {
  const [value, setValue] = (0, react_1.useState)(initialValue);
  const [debouncedValue, setDebouncedValue] = (0, react_1.useState)(initialValue);
  (0, react_1.useEffect)(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return [debouncedValue, setValue];
}
//# sourceMappingURL=useDebouncedSearch.js.map
