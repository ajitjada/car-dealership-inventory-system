import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { vehicleService } from "../../services/vehicle.service";
import { VehicleImage } from "../../types/vehicle.types";

export interface EditVehicleFormInputs {
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

export const EditVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Existing Cloudinary images & deletion queue
  const [existingImages, setExistingImages] = useState<VehicleImage[]>([]);
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

  // Newly selected files & file validation errors
  const [newSelectedFiles, setNewSelectedFiles] = useState<SelectedFilePreview[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditVehicleFormInputs>();

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const vehicle = await vehicleService.getVehicleById(id);
        if (vehicle) {
          setValue("make", vehicle.make);
          setValue("model", vehicle.model);
          setValue("category", vehicle.category);
          setValue("price", vehicle.price);
          setValue("quantity", vehicle.quantity);
          if (vehicle.year) setValue("year", vehicle.year);
          if (vehicle.images) setExistingImages(vehicle.images);
        } else {
          setApiError("Vehicle not found in database.");
        }
      } catch (err: any) {
        setApiError(err.message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id, setValue]);

  const handleFiles = (files: FileList | File[]) => {
    setFileError(null);
    const newFilesArray = Array.from(files);

    const activeExistingCount = existingImages.length;
    const totalFutureCount = activeExistingCount + newSelectedFiles.length + newFilesArray.length;

    if (totalFutureCount > 5) {
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

    setNewSelectedFiles((prev) => [...prev, ...validFiles]);
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

  const handleRemoveExistingImage = (index: number) => {
    const target = existingImages[index];
    if (target.publicId) {
      setDeletedPublicIds((prev) => [...prev, target.publicId!]);
    } else if (target.url) {
      setDeletedImageUrls((prev) => [...prev, target.url]);
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewSelectedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const onSubmit = async (data: EditVehicleFormInputs) => {
    if (!id) return;
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("make", data.make.trim());
      formData.append("model", data.model.trim());
      formData.append("category", data.category.trim());
      formData.append("price", String(data.price));
      formData.append("quantity", String(data.quantity));
      if (data.year) formData.append("year", String(data.year));

      if (deletedPublicIds.length > 0) {
        formData.append("deletedPublicIds", JSON.stringify(deletedPublicIds));
      }

      if (deletedImageUrls.length > 0) {
        formData.append("deletedImageUrls", JSON.stringify(deletedImageUrls));
      }

      newSelectedFiles.forEach((item) => {
        formData.append("images", item.file);
      });

      await vehicleService.updateVehicle(id, formData);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to update vehicle";
      setApiError(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-slate-500 font-bold">Loading vehicle specifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Vehicle Listing
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Update vehicle details, add new images, or remove existing images.
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
          {/* Vehicle Images Management Section */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vehicle Gallery & Image Management (Max 5 Total)
            </label>

            {/* Drag and Drop Zone */}
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
                id="edit-vehicle-images-input"
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="edit-vehicle-images-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl border border-emerald-100 shadow-2xs">
                  ➕
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-emerald-600">Upload additional images</span> or drag files here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    JPG, JPEG, PNG, WEBP (Max 5 MB per file)
                  </p>
                </div>
              </label>
            </div>

            {fileError && <p className="text-xs text-red-600 font-medium">{fileError}</p>}

            {/* Gallery Previews (Existing + New Files) */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Current Gallery ({existingImages.length + newSelectedFiles.length} of 5)
              </span>

              {existingImages.length === 0 && newSelectedFiles.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 font-medium">
                  No images attached to this vehicle yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {/* Existing Cloudinary Images */}
                  {existingImages.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 aspect-square"
                    >
                      <img
                        src={img.url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md text-xs cursor-pointer"
                          title="Delete from vehicle"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="absolute top-1 left-1 text-[8px] font-bold text-white bg-emerald-700 px-1 py-0.5 rounded shadow-xs">
                        Saved
                      </span>
                    </div>
                  ))}

                  {/* Newly Added Files */}
                  {newSelectedFiles.map((item, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative group rounded-xl overflow-hidden border border-amber-300 bg-slate-900 aspect-square"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(index)}
                          className="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md text-xs cursor-pointer"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="absolute top-1 left-1 text-[8px] font-bold text-slate-900 bg-amber-300 px-1 py-0.5 rounded shadow-xs">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          <div className="pt-4 flex justify-end space-x-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-emerald-500"
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
                  <span>Updating Listing...</span>
                </>
              ) : (
                <span>Update Vehicle</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
