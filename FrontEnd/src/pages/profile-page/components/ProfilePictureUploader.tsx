import React from 'react';

type Props = {
  filePreview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ProfilePictureUploader: React.FC<Props> = ({ filePreview, onChange }) => (
  <div className="relative">
    <img
      src={filePreview || '/default-avatar.png'}
      alt="Profile Preview"
      className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 cursor-pointer"
      onClick={() => document.getElementById('file-upload')?.click()}
    />
    <label
      htmlFor="file-upload"
      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer"
    >
      ✏️
    </label>
    <input
      type="file"
      id="file-upload"
      accept="image/*"
      onChange={onChange}
      className="hidden"
    />
  </div>
);
