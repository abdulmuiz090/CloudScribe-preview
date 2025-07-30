/**
 * WalletPage Component
 * Purpose: Complete wallet management with Paystack integration
 * Features: Balance display, transaction history, payout requests, bank setup
 * Platform Fee: Automatic 10% deduction from sales handled in checkout process
 */
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  CreditCard,
  Send,
  Building2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Transaction interface matching database structure
interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit' | 'payout' | 'sale' | 'fee';
  description: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: any;
}

// Bank details interface
interface BankDetails {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
}

// Nigerian banks supported by Paystack
const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '014', name: 'Afribank' },
  { code: '023', name: 'Citibank' },
  { code: '058', name: 'Diamond Bank' },
  { code: '011', name: 'First Bank' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '085', name: 'Finbank' },
  { code: '057', name: 'Guaranty Trust Bank' },
  { code: '032', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '084', name: 'Skye Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' }
];

const WalletPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Wallet state management
  const [balance, setBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payout form state
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    account_name: '',
    account_number: '',
    bank_code: '',
    bank_name: ''
  });
  const [verifyingBank, setVerifyingBank] = useState(false);

  // Fetch wallet data with improved error handling
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try edge function first
      try {
        const { data: balanceData, error: balanceError } = await supabase.functions.invoke('get-wallet-balance');
        
        if (balanceError) {
          console.warn('Edge function failed, falling back to direct database query:', balanceError);
          throw balanceError;
        }

        if (balanceData) {
          setBalance(balanceData.balance || 0);
          setPendingBalance(balanceData.pending || 0);
          setTotalEarnings(balanceData.total_earnings || 0);
          
          if (balanceData.bank_details) {
            // Properly type cast bank_details
            const typedBankDetails: BankDetails = {
              account_name: balanceData.bank_details.account_name || '',
              account_number: balanceData.bank_details.account_number || '',
              bank_code: balanceData.bank_details.bank_code || '',
              bank_name: balanceData.bank_details.bank_name || ''
            };
            setBankDetails(typedBankDetails);
          }
        }
      } catch (edgeFunctionError) {
        console.warn('Edge function failed, using direct database query');
        
        // Fallback to direct database query
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (walletError) {
          throw new Error('Failed to fetch wallet data');
        }

        setBalance(walletData?.available_balance || 0);
        setPendingBalance(walletData?.pending_balance || 0);
        setTotalEarnings(walletData?.total_earnings || 0);
        
        if (walletData?.bank_details) {
          // Properly handle JSON bank_details from database
          const bankDetailsJson = walletData.bank_details as any;
          const typedBankDetails: BankDetails = {
            account_name: bankDetailsJson.account_name || '',
            account_number: bankDetailsJson.account_number || '',
            bank_code: bankDetailsJson.bank_code || '',
            bank_name: bankDetailsJson.bank_name || ''
          };
          setBankDetails(typedBankDetails);
        }
      }
      
      // Fetch transaction history
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionsError) {
        console.warn('Failed to fetch transactions:', transactionsError);
        // Don't throw error for transactions - just log it
      } else {
        // Type cast the transactions data
        const typedTransactions: Transaction[] = (transactionsData || []).map(transaction => ({
          ...transaction,
          type: transaction.type as 'credit' | 'debit' | 'payout' | 'sale' | 'fee',
          status: transaction.status as 'pending' | 'completed' | 'failed'
        }));
        setTransactions(typedTransactions);
      }
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load wallet data');
      toast({
        title: "Error",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify bank account with better error handling
  const verifyBankAccount = async () => {
    if (!bankDetails.account_number || !bankDetails.bank_code) {
      toast({
        title: "Incomplete Details",
        description: "Please provide account number and select a bank.",
        variant: "destructive",
      });
      return;
    }

    try {
      setVerifyingBank(true);
      
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: { 
          account_number: bankDetails.account_number,
          bank_code: bankDetails.bank_code 
        }
      });

      if (error) {
        throw new Error(error.message || 'Bank verification failed');
      }

      if (data?.account_name) {
        setBankDetails(prev => ({
          ...prev,
          account_name: data.account_name
        }));
        
        toast({
          title: "Account Verified",
          description: `Account belongs to ${data.account_name}`,
        });
      } else {
        throw new Error('Could not verify account details');
      }
    } catch (error) {
      console.error('Bank verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Could not verify bank account. Please check details.",
        variant: "destructive",
      });
    } finally {
      setVerifyingBank(false);
    }
  };

  // Handle payout request with improved validation
  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (!payoutAmount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payout amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Payout amount cannot exceed your current balance.",
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Minimum Amount",
        description: "Minimum payout amount is ₦100.",
        variant: "destructive",
      });
      return;
    }

    if (!bankDetails.account_name || !bankDetails.account_number || !bankDetails.bank_code) {
      toast({
        title: "Bank Details Required",
        description: "Please add and verify your bank details first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRequestingPayout(true);
      
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { 
          amount: amount,
          bank_details: bankDetails
        }
      });

      if (error) {
        throw new Error(error.message || 'Payout request failed');
      }

      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and will be processed within 2-3 business days.",
      });

      setPayoutAmount('');
      fetchWalletData(); // Refresh wallet data
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  // Set up real-time transaction updates
  useEffect(() => {
    if (user) {
      fetchWalletData();

      // Subscribe to wallet transaction changes
      const transactionSubscription = supabase
        .channel('wallet-transactions-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchWalletData(); // Refresh on new transactions
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(transactionSubscription);
      };
    }
  }, [user]);

  if (error && !loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Error Loading Wallet</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchWalletData} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading wallet data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
            <p className="text-muted-foreground">
              Manage your earnings and payouts. Platform fee of 10% is automatically deducted from sales.
            </p>
          </div>
          <Button onClick={fetchWalletData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Available for payout
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{pendingBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Processing payouts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All-time earnings (after 10% platform fee)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Management Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payout">Request Payout</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
          </TabsList>
          
          {/* Transaction History Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your earnings and payout history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Your earnings and transactions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'credit' || transaction.type === 'sale' ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()} • {transaction.type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'credit' || transaction.type === 'sale' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' || transaction.type === 'sale' ? '+' : '-'}₦{transaction.amount.toFixed(2)}
                          </p>
                          <p className={`text-xs capitalize ${
                            transaction.status === 'completed' ? 'text-green-600' : 
                            transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payout Request Tab */}
          <TabsContent value="payout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  Request a payout to your Nigerian bank account. Minimum payout is ₦100.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payout Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="100"
                    max={balance}
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available balance: ₦{balance.toFixed(2)}
                  </p>
                </div>
                
                <Button 
                  onClick={handlePayoutRequest}
                  disabled={requestingPayout || !payoutAmount || parseFloat(payoutAmount) < 100 || parseFloat(payoutAmount) > balance}
                  className="w-full"
                >
                  {requestingPayout ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {requestingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Minimum payout amount: ₦100.00</p>
                  <p>• Processing time: 2-3 business days</p>
                  <p>• Payouts are processed via Paystack</p>
                  <p>• No processing fees charged</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Details</CardTitle>
                <CardDescription>
                  Add your Nigerian bank account for payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank</Label>
                    <Select 
                      value={bankDetails.bank_code} 
                      onValueChange={(value) => {
                        const selectedBank = NIGERIAN_BANKS.find(bank => bank.code === value);
                        setBankDetails(prev => ({
                          ...prev,
                          bank_code: value,
                          bank_name: selectedBank?.name || '',
                          account_name: '' // Reset account name when bank changes
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_BANKS.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      placeholder="1234567890"
                      value={bankDetails.account_number}
                      onChange={(e) => setBankDetails(prev => ({
                        ...prev,
                        account_number: e.target.value,
                        account_name: '' // Reset account name when number changes
                      }))}
                    />
                  </div>
                </div>

                {bankDetails.account_name && (
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{bankDetails.account_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={verifyBankAccount} 
                    variant="outline" 
                    className="flex-1"
                    disabled={verifyingBank || !bankDetails.account_number || !bankDetails.bank_code}
                  >
                    {verifyingBank ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="mr-2 h-4 w-4" />
                    )}
                    {verifyingBank ? 'Verifying...' : 'Verify Account'}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Account verification is required for payouts</p>
                  <p>• Only Nigerian bank accounts are supported</p>
                  <p>• Account details are encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default WalletPage;
