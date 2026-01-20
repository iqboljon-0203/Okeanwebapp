export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return defaultValue;
  }
};

export const removeStorageItem = (key) => {
  localStorage.removeItem(key);
};
