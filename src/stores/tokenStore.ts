import { defineStore } from 'pinia';

export const useTokenStore = defineStore('counter', {
  state: () => ({
    token: '',
  }),
  getters: {

  },
  actions: {
    setToken(token: string) {
      this.token = token;
    }
  },
});
