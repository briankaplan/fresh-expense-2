import { ConnectButton } from '@/components/teller/connect-button'
import { AccountsList } from '@/components/teller/accounts-list'
import { prisma } from '@/lib/db'

export default async function AccountsPage() {
  // TODO: Replace with actual user ID
  const userId = 'test-user'
  
  const accounts = await prisma.tellerAccount.findMany({
    where: {
      connection: {
        userId,
        status: 'active'
      }
    },
    include: {
      transactions: {
        orderBy: {
          date: 'desc'
        },
        include: {
          receipt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Connect and manage your bank accounts
          </p>
        </div>
        <ConnectButton 
          onSuccess={(enrollmentId) => {
            console.log('Connected:', enrollmentId)
          }}
          onExit={() => {
            console.log('Exited')
          }}
        />
      </div>

      <AccountsList accounts={accounts} />
    </div>
  )
} 