import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getContacts() {
  return prisma.contact.findMany({
    include: {
      site: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: [{ isChampion: 'desc' }, { name: 'asc' }],
  })
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  const champions = contacts.filter((c) => c.isChampion)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Contacts
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            {contacts.length} contacts across all customers
          </p>
        </div>
        <Link href="/contacts/new" className="btn-primary btn-md">
          + Add Contact
        </Link>
      </div>

      {/* Champions Section */}
      {champions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
            <span className="text-warning-500">★</span> Champions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {champions.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {/* All Contacts */}
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="font-semibold text-surface-900 dark:text-surface-100">
            All Contacts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Customer / Site
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-surface-50 dark:hover:bg-primary-800">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {contact.isChampion && (
                        <span className="text-warning-500">★</span>
                      )}
                      <span className="font-medium text-surface-900 dark:text-surface-100">
                        {contact.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-surface-600 dark:text-surface-400">
                    {contact.role || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/customers/${contact.site.customer.id}`}
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {contact.site.customer.name}
                    </Link>
                    <span className="text-surface-500 text-sm"> / {contact.site.name}</span>
                  </td>
                  <td className="px-5 py-4 text-surface-600 dark:text-surface-400">
                    {contact.email || '-'}
                  </td>
                  <td className="px-5 py-4 text-surface-600 dark:text-surface-400">
                    {contact.phone || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/contacts/${contact.id}/edit`}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ContactCard({ contact }: { contact: any }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-warning-500">★</span>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">
              {contact.name}
            </h3>
          </div>
          <p className="text-sm text-surface-500">{contact.role}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <Link
            href={`/customers/${contact.site.customer.id}`}
            className="text-primary-600 hover:text-primary-500"
          >
            {contact.site.customer.name}
          </Link>
          <span className="text-surface-500"> - {contact.site.name}</span>
        </div>
        {contact.email && (
          <p className="text-surface-600 dark:text-surface-400">{contact.email}</p>
        )}
        {contact.phone && (
          <p className="text-surface-600 dark:text-surface-400">{contact.phone}</p>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700">
        <Link
          href={`/contacts/${contact.id}/edit`}
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Edit Contact
        </Link>
      </div>
    </div>
  )
}
