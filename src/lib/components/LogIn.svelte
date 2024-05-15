<script>
    import { auth, provider } from '../../firebase.js';
    import { signInWithPopup } from 'firebase/auth';
    import { goto } from '$app/navigation';
  
    async function login() {
      try {
        await signInWithPopup(auth, provider);
        alert('Login successful!');
        goto('/');  // Redirect to the main page after successful login
      } catch (error) {
        console.error('Error logging in: ', error);
      }
    }
  </script>
  

<main class="flex place-content-center items-center h-screen">
    <div class="flex flex-col place-content-center items-center w-1/2">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col items-center space-y-2 text-center">
                <h1 class="text-2xl font-semibold mb-[10px]">
                    Log in with
                </h1>
                <!-- <form>
                    <p class="text-sm text-neutral-500 pb-[5px] pt-[15px]">
                        Username or Email:
                    </p>
                    <input type="text" name="Name" required class="input-style">

                    <p class="text-sm text-neutral-500 pb-[5px] pt-[15px]">
                        Password:
                    </p>
                    <input type="Password" required class="input-style">
                    <p class="text-center text-xs uppercase">
                        <a href="#" class="hover:underline">Forgot Password?</a>
                    </p>
                </form> -->
                <button on:click={login} class="btn bg-[#1c1c1c] hover:bg-[#141414] rounded-lg w-[250px]">
                    <i class="fa-brands fa-google"></i>Google
                </button>

            </div>
                <p class="text-center text-xs uppercase">
                    Or continue with
                </p>
            <div class="flex join-vertical justify-center">
                <button class="btn bg-[#1c1c1c] hover:bg-[#141414] rounded-lg mx-[5px]">
                    <i class="fa-brands fa-github"></i>GitHub
                </button>
                <button class="btn bg-[#1c1c1c] hover:bg-[#141414] rounded-lg mx-[5px]">
                    <i class="fa-regular fa-envelope"></i>Email
                </button>
                <button class="btn bg-[#1c1c1c] hover:bg-[#141414] rounded-lg mx-[5px]">
                    <i class="fa-brands fa-apple"></i>Apple
                </button>
            </div>

            <p class="text-center text-sm text-neutral-700 ">
				<a href="#" class="hover:underline">
					Terms of Service
				</a>
				and
				<a href="#" class="hover:underline">
					Privacy Policy
				</a>
			</p>
        </div>
    </div>
</main>

<style>

    button.btn {
        font-weight: 600;
        font-size: 1rem;
    }
</style>
