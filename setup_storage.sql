-- "product-images" nomli storage bucketni yaratish
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Hamma uchun rasm o'qish (ko'rish) ruxsatini berish (Public ruxsat)
create policy "Rasmlarni ko'rish ruxsati"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- Rasm yuklash (insert) ruxsatini berish
create policy "Rasmlarni yuklash ruxsati"
on storage.objects for insert
to public
with check ( bucket_id = 'product-images' );

-- Rasmlarni o'chirish uchun ruxsat
create policy "Rasmlarni o'chirish ruxsati"
on storage.objects for delete
to public
using ( bucket_id = 'product-images' );

-- Rasmlarni yangilash uchun ruxsat
create policy "Rasmlarni yangilash ruxsati"
on storage.objects for update
to public
using ( bucket_id = 'product-images' );
