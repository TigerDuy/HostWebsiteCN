import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// utility to create blob from canvas
const getCroppedImg = (imageSrc, pixelCrop, outputSize = 512) => {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const sx = pixelCrop.x * scaleX;
        const sy = pixelCrop.y * scaleY;
        const sWidth = pixelCrop.width * scaleX;
        const sHeight = pixelCrop.height * scaleY;

        ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas is empty'));
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.92);
      } catch (e) { reject(e); }
    };
    image.onerror = (e) => reject(new Error('Cannot load image'));
    image.src = imageSrc;
  });
};

export default function AvatarCropper({ file, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const reader = new FileReader();
  const [imageSrc, setImageSrc] = useState(null);
  if (!imageSrc && file) {
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      onComplete(croppedFile);
    } catch (err) {
      console.error('Crop error', err);
      alert('Lỗi khi cắt ảnh');
    }
  };

  return (
    <div className="avatar-cropper-modal">
      <div className="avatar-cropper-inner">
        <div className="crop-area">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div className="crop-controls">
          <label>Zoom</label>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          <div className="crop-buttons">
            <button type="button" onClick={onCancel}>Hủy</button>
            <button type="button" onClick={handleConfirm}>Xác nhận & Upload</button>
          </div>
        </div>
      </div>
      <style>{`
        .avatar-cropper-modal { position: fixed; inset:0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; }
        .avatar-cropper-inner { background: white; padding: 16px; border-radius:8px; width: 520px; max-width:95%; }
        .crop-area { position: relative; width: 100%; height: 400px; background: #333; }
        .crop-controls { margin-top:8px; display:flex; flex-direction:column; gap:8px; }
        .crop-buttons { display:flex; gap:8px; justify-content:flex-end; }
      `}</style>
    </div>
  );
}
