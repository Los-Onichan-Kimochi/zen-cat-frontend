import { useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { Card, CardContent, CardHeader } from '../card';

interface CardDirectionProps {
  isOnGray?: boolean;
  currentRegion: string;  // New prop
  setCRegion: (value: string) => void;  // New prop
  currentProvince: string;
  setCProvince: (value: string) => void;
  currentDistrict: string;
  setCDistrict: (value: string) => void;
  currentAddress: string;
  setCAddress: (value: string) => void;
  currentPostal: string;
  setCPostal: (value: string) => void;
}

const CardDirection: React.FC<CardDirectionProps> = ({
  isOnGray = true,
  currentRegion,  // New prop
  setCRegion,  // New prop
  currentProvince,
  setCProvince,
  currentDistrict,
  setCDistrict,
  currentAddress,
  setCAddress,
  currentPostal,
  setCPostal
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('---------------------');
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
        <h2 className="text-2xl font-bold text-center">Dirección personal</h2>
        <p className="text-gray-500 text-sm text-center">
          Estos son sus datos personales registrados en nuestro sistema
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <form id="personal_form" onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">


          {/* First row split into two columns (3/4 + 1/4) */}
          <div className="flex gap-4">

            {/* Province - takes 3/4 width */}
            <div className="flex-1" style={{ flex: 3 }}>
              <label className="block text-gray-700 text-sm mb-1">Provincia</label>
              <Input
                value={currentProvince}
                onChange={(e) => setCProvince(e.target.value)}
                disabled={isOnGray}
                className={isOnGray ? "disabled:opaProvince-100 disabled:cursor-default bg-gray-50" : ""}
                required
              />
            </div>

            {/* Postal - takes 1/4 width */}
            <div className="flex-1" style={{ flex: 1 }}>
              <label className="block text-gray-700 text-sm mb-1">Postal</label>
              <Input
                value={currentPostal}
                onChange={(e) => setCPostal(e.target.value)}
                disabled={isOnGray}
                className={isOnGray ? "disabled:opaProvince-100 disabled:cursor-default bg-gray-50" : ""}
                required
              />
            </div>
          </div>
          {/* New Region Row - full width */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Región</label>
            <Input
              value={currentRegion}
              onChange={(e) => setCRegion(e.target.value)}
              disabled={isOnGray}
              className={isOnGray ? "disabled:opaProvince-100 disabled:cursor-default bg-gray-50" : ""}
              required
            />
          </div>
          {/* District Row - full width */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Distrito</label>
            <Input
              value={currentDistrict}
              onChange={(e) => setCDistrict(e.target.value)}
              disabled={isOnGray}
              className={isOnGray ? "disabled:opaProvince-100 disabled:cursor-default bg-gray-50" : ""}
              required
            />
          </div>

          {/* Address Row - full width */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Dirección</label>
            <Input
              value={currentAddress}
              onChange={(e) => setCAddress(e.target.value)}
              disabled={isOnGray}
              className={isOnGray ? "disabled:opaProvince-100 disabled:cursor-default bg-gray-50" : ""}
              required
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CardDirection;