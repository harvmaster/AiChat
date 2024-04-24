import { defineStore } from 'pinia';

export const useTokenStore = defineStore('token', {
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
