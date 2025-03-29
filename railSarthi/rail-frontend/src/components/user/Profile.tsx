import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  firstName: z.string().min(3).max(30).optional(),
  lastName: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  city: z.string().min(3).max(50).optional(),
  state: z.string().min(3).max(50).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  age: z.number().int().min(1).max(120).optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(3).max(100),
  newPassword: z.string().min(3).max(100),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function Profile() {
  const [profile, setProfile] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {

      const response = await api.get("/api/v1/user/profile");
      
      if (response.data && response.data.profile) {
        const profileData = response.data.profile;
        setProfile(profileData);
        // Reset form with the new data
        resetProfileForm(profileData);
        setLoading(false);
      } else {
        setError("Invalid profile data received from server");
        setLoading(false);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch profile");
      }
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      console.log("Updating profile with data:", data);
      const response = await api.put("/api/v1/user/update-profile", data);
      console.log("Profile update response:", response.data);
      
      setSuccess("Profile updated successfully");
      fetchProfile();
    } catch (err: any) {
      console.error("Profile update error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to update profile");
      }
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      console.log("Updating password...");
      const response = await api.put("/api/v1/user/reset-password", data);
      console.log("Password update response:", response.data);
      
      setSuccess("Password updated successfully");
      setShowPasswordForm(false);
      resetPasswordForm();
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to update password");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...registerProfile("firstName")}
                  defaultValue={profile?.firstName}
                  type="text"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...registerProfile("lastName")}
                  defaultValue={profile?.lastName}
                  type="text"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...registerProfile("email")}
                  defaultValue={profile?.email}
                  type="email"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  {...registerProfile("age", { valueAsNumber: true })}
                  defaultValue={profile?.age}
                  type="number"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.age && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.age.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  {...registerProfile("gender")}
                  defaultValue={profile?.gender}
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {profileErrors.gender && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  {...registerProfile("city")}
                  defaultValue={profile?.city}
                  type="text"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  {...registerProfile("state")}
                  defaultValue={profile?.state}
                  type="text"
                  className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {profileErrors.state && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.state.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="hover:text-indigo-500 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Profile
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm text-white hover:text-indigo-500"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    {...registerPassword("oldPassword")}
                    type="password"
                    className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    {...registerPassword("newPassword")}
                    type="password"
                    className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 