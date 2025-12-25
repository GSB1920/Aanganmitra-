// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerWritable } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const supabase = await supabaseServerWritable();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is approved
    const { data: profile } = await supabase
      .from('profiles')
      .select('approved')
      .eq('id', user.id)
      .single();

    if (!profile?.approved) {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
    }

    // Prepare property data aligned to listing UI
    const propertyData = {
      title: formData.get('title') as string,
      city: formData.get('city') as string,
      area: formData.get('area') as string,
      address: formData.get('address') as string,
      zoning: formData.get('zoning') as string,
      property_type: formData.get('property_type') as string,
      listing_type: formData.get('listing_type') as string || 'sale',
      rera: formData.get('rera') === 'on',
      area_sqft: formData.get('area_sqft') ? Number(formData.get('area_sqft')) : null,
      rate_per_sqft: formData.get('rate_per_sqft') ? Number(formData.get('rate_per_sqft')) : null,
      latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
      longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null,
      owner_name: formData.get('owner_name') as string,
      owner_address: formData.get('owner_address') as string,
      owner_phone: formData.get('owner_phone') as string,
      asking_price: Number(formData.get('asking_price')),
      final_price: formData.get('final_price') ? Number(formData.get('final_price')) : null,
      created_by: user.id,
    };

    // Insert property
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: data });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
