<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="submitLogin">
      <label for="username">Usuario:</label>
      <input id="username" v-model="username" type="text" autocomplete="username" required />

      <label for="password">Contraseña:</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <button type="submit" :disabled="loading">{{ loading ? 'Ingresando...' : 'Entrar' }}</button>
    </form>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false,
    };
  },
  methods: {
    async submitLogin() {
      if (!this.username || !this.password) {
        Swal.fire('Error', 'Por favor ingresa usuario y contraseña.', 'warning');
        return;
      }

      this.loading = true;
      try {
        const response = await fetch("https://tienda-mu-nine.vercel.app/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: this.username, pass: this.password }),
        });

        if (!response.ok) throw new Error("Credenciales inválidas");

        const result = await response.json();
        if (result.statusCode === 200) {
          sessionStorage.setItem('authToken', result.hash ? result.hash : 'temphash');
          Swal.fire({
            icon: "success",
            title: "Login exitoso",
            timer: 1200,
            showConfirmButton: false,
          });

          this.$router.push('/orders');
        } else {
          throw new Error(result.message || "Credenciales inválidas");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 360px;
  margin: 80px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #3b5998;
}

form label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #5c6ac4;
  outline: none;
}

button {
  width: 100%;
  background-color: #5c6ac4;
  color: white;
  border: none;
  padding: 12px;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #4b57a1;
}
</style>

