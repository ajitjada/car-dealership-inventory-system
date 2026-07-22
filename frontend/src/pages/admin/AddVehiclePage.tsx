import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { vehicleService } from "../../services/vehicle.service";

export interface AddVehicleFormInputs {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
}

interface SelectedFilePreview {
  file: File;
  previewUrl: string;
}

export const AddVehiclePage: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFilePreview[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddVehicleFormInputs>();

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleFiles = (files: FileList | File[]) => {
    setFileError(null);
    const newFilesArray = Array.from(files);

    if (selectedFiles.length + newFilesArray.length > 5) {
      setFileError("Maximum 5 images allowed per vehicle.");
      return;
    }

    const validFiles: SelectedFilePreview[] = [];

    for (const file of newFilesArray) {
      if (!allowedTypes.includes(file.type)) {
        setFileError(`"${file.name}" is an invalid format. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 5 MB file size limit.`);
        return;
      }

      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const onSubmit = async (data: AddVehicleFormInputs) => {
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("make", data.make.trim());
      formData.append("model", data.model.trim());
      formData.append("category", data.category.trim());
      formData.append("price", String(data.price));
      formData.append("quantity", String(data.quantity));
      if (data.year) formData.append("year", String(data.year));

      selectedFiles.forEach((item) => {
        formData.append("images", item.file);
      });

      await vehicleService.createVehicle(formData);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to create vehicle";
      setApiError(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Add New Vehicle
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create a vehicle listing with specifications and up to 5 images.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-bold text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100/80 space-y-6">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-xs font-semibold text-red-800">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Multiple Image Upload Drag & Drop Zone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vehicle Images (Max 5 Images, up to 5 MB each)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isDragOver
                  ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
                  : "border-slate-300 hover:border-emerald-400 bg-slate-50/50"
                }`}
            >
              <input
                id="vehicle-images-input"
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="vehicle-images-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-100 shadow-2xs">
                  📁
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-emerald-600">Click to upload</span> or drag and drop images here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supported: JPG, JPEG, PNG, WEBP (Max 5 MB per file)
                  </p>
                </div>
              </label>
            </div>

            {fileError && <p className="text-xs text-red-600 font-medium">{fileError}</p>}

            {/* Selected File Previews */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {selectedFiles.map((item, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md text-xs cursor-pointer"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white bg-black/60 px-1 py-0.5 rounded truncate">
                      {item.file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Make *
              </label>
              <input
                id="make"
                type="text"
                placeholder="e.g., Toyota"
                {...register("make", { required: "Vehicle make is required" })}
                className={`w-full px-3 py-2.5 border ${errors.make ? "border-red-500" : "border-slate-300"
                  } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.make && <p className="text-xs text-red-600 mt-1 font-medium">{errors.make.message}</p>}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Model *
              </label>
              <input
                id="model"
                type="text"
                placeholder="e.g., Camry"
                {...register("model", { required: "Vehicle model is required" })}
                className={`w-full px-3 py-2.5 border ${errors.model ? "border-red-500" : "border-slate-300"
                  } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.model && <p className="text-xs text-red-600 mt-1 font-medium">{errors.model.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className={`w-full px-3 py-2.5 border ${errors.category ? "border-red-500" : "border-slate-300"
                  } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-2xs`}
              >
                <option value="">Select Category</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Hatchback">Hatchback</option>
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1 font-medium">{errors.category.message}</p>}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year (Optional)
              </label>
              <input
                id="year"
                type="number"
                placeholder="e.g., 2024"
                {...register("year", {
                  min: { value: 1900, message: "Year must be valid" },
                })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
              />
              {errors.year && <p className="text-xs text-red-600 mt-1 font-medium">{errors.year.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="25000"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be greater than 0" },
                })}
                className={`w-full px-3 py-2.5 border ${errors.price ? "border-red-500" : "border-slate-300"
                  } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1 font-medium">{errors.price.message}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                placeholder="5"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
                className={`w-full px-3 py-2.5 border ${errors.quantity ? "border-red-500" : "border-slate-300"
                  } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.quantity && <p className="text-xs text-red-600 mt-1 font-medium">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Saving Vehicle & Images...</span>
                </>
              ) : (
                <span>Save Vehicle Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
