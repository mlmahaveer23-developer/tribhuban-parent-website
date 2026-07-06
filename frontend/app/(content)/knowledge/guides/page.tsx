import { redirect } from 'next/navigation';
// Guides live in the Knowledge Centre under the #guides anchor
export default function GuidesPage() {
  redirect('/knowledge#guides');
}
