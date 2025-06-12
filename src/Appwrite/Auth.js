import conf from "../conf/conf";
import { Client, Account, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (userAccount) {
        // call another method
        return this.login({ email, password });
      } else {
        return userAccount;
      }
    } catch (error) {
      console.log("Appwrite service :: createAccount :: error ", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      const response = await this.account.createEmailPasswordSession(
        email,
        password
      );

      return response;
    } catch (error) {
      console.log("Appwrite service :: login :: error ", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const acc = await this.account.get();
      if (acc) return acc;
      else
        throw new Error(
          "Error :: getCurrentUser Error in getting account:",
          acc
        );
    } catch (error) {
      console.log("Appwrite service :: getCurrentUser :: error ", error);
    }
  }

  async logout() {
    try {
      const response = await this.account.deleteSession("current");

      if (response) return response;
      else throw new Error("Error :: logout:", response);
    } catch (error) {
      console.log("Appwrite service :: logout :: error ", error);
      throw error;
    }
  }

  async logoutFromAllDevices() {
    try {
      const response = await this.account.deleteSessions();

      if (response) return response;
      else throw new Error("Error :: logoutFromAllDevices:", response);
    } catch (error) {
      console.log("Appwrite service :: logoutFromAllDevices :: error ", error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
