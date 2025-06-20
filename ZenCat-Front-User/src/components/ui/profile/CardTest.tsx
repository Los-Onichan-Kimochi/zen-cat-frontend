import { useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { Card, CardContent, CardHeader } from '../card';

interface CardTestProps {
    isOnGray?: boolean;
    address: string;
    setAddress: (value: string) => void;
}

const CardTest: React.FC<CardTestProps> = ({
    isOnGray = true,
    address,
    setAddress
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
                <form id="direction_form" onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">

                    {/* Address Row - full width */}
                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Dirección</label>
                        <Input
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                            }
                            }
                            disabled={isOnGray}
                            className={isOnGray ? "disabled:opacity-100 disabled:cursor-default bg-gray-50" : ""}
                            required
                        />
                    </div>


                </form>
            </CardContent>
        </Card>
    );
};

export default CardTest;