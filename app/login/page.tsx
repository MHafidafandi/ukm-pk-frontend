"use client";

import { LoginForm } from "@/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#191022]">
      {/* Left Side: Illustration and Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/10 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/30">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
                <path
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
            Sipeduli Community
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base mb-8 leading-relaxed">
            Connecting social care programs with local small businesses to build
            a more resilient community together.
          </p>
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/40 rounded-xl blur opacity-75"></div>
            <div className="relative bg-white dark:bg-[#191022] p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <img
                alt="Community meeting and social care planning session"
                className="rounded-lg shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbYLudT4P98_f-E-0VgYVUaVpsqHVAlYl4H4ah3_euzbw8eqwzABasWUG_ALqpNk9uNd5tZjy6j4kZSieLrgXRmuTVnoi7gUfjjvXLgj1ABAcpRh02JYltLUIYiEoCwvMONDADVrxbve7LJE2kpybqG04MfU95u5C_uVh2SsGWOBL3_v5S6wDQOO29AQpNhuG1x70oXy-IIV8QKE02lyQKpfqfTmdEAgeeUcsAgyvD5g2_AI_bdIo-bU3wDSGSd2qJlhTH-2v-HQtp"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col items-center justify-center p-4 lg:p-8 bg-white dark:bg-[#191022]">
        <div className="w-full max-w-sm xl:max-w-md m-auto flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="size-6 text-white"
                fill="currentColor"
                viewBox="0 0 48 48"
              >
                <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Sipeduli
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Login To Dashboard UKM-PK
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your credentials to access the community portal.
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{" "}
              <a className="font-bold text-primary hover:underline" href="#">
                Request Access
              </a>
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 grayscale opacity-50">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                Secure Access
              </span>
            </div>
            <div className="flex items-center gap-1.5 grayscale opacity-50">
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                Cloud Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
