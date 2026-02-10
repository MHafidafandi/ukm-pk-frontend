"use client";

import { useState } from "react";
import { Heart, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { getMeService, loginService } from "@/lib/api/auth-service";
import { useRouter } from "next/navigation";

const images = [
  { id: 1, src: "/images/1.jpg", alt: "Gambar 1", caption: "Caption 1" },
  { id: 2, src: "/images/2.jpg", alt: "Gambar 2", caption: "Caption 2" },
  { id: 3, src: "/images/3.jpg", alt: "Gambar 3", caption: "Caption 3" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: saveAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Error", {
        description: "Email dan password wajib diisi",
        action: {
          label: "Undo",
          onClick: () => {
            console.log("Undo clicked");
          },
        },
      });
      return;
    }
    setLoading(true);
    const success = await loginService({ email, password });
    setLoading(false);
    if (success) {
      const response = await getMeService();
      saveAuth(response, success);
      toast("Success", {
        description: "Selamat datang kembali!",
        action: {
          label: "Undo",
          onClick: () => {
            console.log("Undo clicked");
          },
        },
      });
      router.push("/dashboard");
    } else {
      toast("Error", {
        description: "Terjadi saat login. Periksa kembali kredensial Anda.",
        action: {
          label: "Undo",
          onClick: () => {
            console.log("Undo clicked");
          },
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        {/* <div className="absolute inset-0 z-0">
          <ImageCarousel
            images={images}
            aspectRatio="aspect-[16/9]"
            autoplay={true}
            showControls={true}
            className="max-w-2xl"
          />
        </div> */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">
            SI-PEDULI
          </span>
        </Link>

        <div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-primary-foreground">
            Kelola Kegiatan Sosial dengan Lebih Mudah
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Platform terintegrasi untuk manajemen kegiatan, donasi, anggota, dan
            dokumentasi UKM Peduli Kemanusiaan.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © 2024 SI-PEDULI. Seluruh hak cipta dilindungi.
        </p>
      </div>

      {/* Right side - login form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                SI-PEDULI
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-2 text-muted-foreground">
              Masukkan kredensial untuk mengakses dashboard
            </p>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@sipeduli.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>

              <div className="mt-6 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Demo Account:</p>
                <p>Admin: admin@sipeduli.id</p>
                <p>Member: member@sipeduli.id</p>
                <p>Password: (any)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
