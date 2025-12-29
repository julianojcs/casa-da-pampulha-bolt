import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { GuestRegistration, GuestRegistrationDocument } from '@/models/GuestRegistration';
import mongoose from 'mongoose';

interface VehiclePlate {
  _id?: mongoose.Types.ObjectId;
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
}

// GET - Listar veículos do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Buscar registro de hóspede pelo email do usuário
    const guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    }).lean() as (GuestRegistrationDocument & { vehiclePlates: VehiclePlate[] }) | null;

    if (!guestRegistration) {
      return NextResponse.json({ vehicles: [] });
    }

    return NextResponse.json({
      vehicles: guestRegistration.vehiclePlates || [],
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return NextResponse.json({ error: 'Erro ao buscar veículos' }, { status: 500 });
  }
}

// POST - Adicionar veículo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { brand, model, color, plate } = body;

    if (!plate) {
      return NextResponse.json({ error: 'Placa é obrigatória' }, { status: 400 });
    }

    // Buscar ou criar registro de hóspede
    let guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    });

    if (!guestRegistration) {
      // Se não existe registro, criar um básico
      guestRegistration = new GuestRegistration({
        name: session.user.name,
        email: session.user.email,
        phone: '',
        documentType: 'CPF',
        checkInDate: new Date(),
        checkOutDate: new Date(),
        agreedToRules: true,
        vehiclePlates: [],
      });
    }

    // Adicionar veículo
    const newVehicle = {
      _id: new mongoose.Types.ObjectId(),
      brand,
      model,
      color,
      plate: plate.toUpperCase(),
    };

    guestRegistration.vehiclePlates.push(newVehicle);
    await guestRegistration.save();

    return NextResponse.json({
      message: 'Veículo adicionado',
      vehicle: newVehicle,
    });
  } catch (error) {
    console.error('Erro ao adicionar veículo:', error);
    return NextResponse.json({ error: 'Erro ao adicionar veículo' }, { status: 500 });
  }
}

// PUT - Atualizar veículo
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { vehicleId, brand, model, color, plate } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: 'ID do veículo é obrigatório' }, { status: 400 });
    }

    const guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    });

    if (!guestRegistration) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    // Encontrar e atualizar veículo
    const vehicleIndex = guestRegistration.vehiclePlates.findIndex(
      (v: { _id?: { toString: () => string } }) => v._id?.toString() === vehicleId
    );

    if (vehicleIndex === -1) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 });
    }

    guestRegistration.vehiclePlates[vehicleIndex] = {
      ...guestRegistration.vehiclePlates[vehicleIndex],
      brand,
      model,
      color,
      plate: plate.toUpperCase(),
    };

    await guestRegistration.save();

    return NextResponse.json({ message: 'Veículo atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json({ error: 'Erro ao atualizar veículo' }, { status: 500 });
  }
}

// DELETE - Remover veículo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json({ error: 'ID do veículo é obrigatório' }, { status: 400 });
    }

    const guestRegistration = await GuestRegistration.findOne({
      email: session.user.email,
    });

    if (!guestRegistration) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    // Remover veículo
    guestRegistration.vehiclePlates = guestRegistration.vehiclePlates.filter(
      (v: { _id?: { toString: () => string } }) => v._id?.toString() !== vehicleId
    );

    await guestRegistration.save();

    return NextResponse.json({ message: 'Veículo removido' });
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
    return NextResponse.json({ error: 'Erro ao remover veículo' }, { status: 500 });
  }
}
