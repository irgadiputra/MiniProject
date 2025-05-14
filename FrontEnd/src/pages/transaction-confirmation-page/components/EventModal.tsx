import React, { useState } from 'react';
import { IEvent, ITransaction } from './type'; 
import { formatCurrency, formatDate } from './utils'; 

interface EventModalProps {
  event: IEvent;
  onClose: () => void;
  onTransactionStatusChange: (transactionId: number, status: string) => void; 
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onTransactionStatusChange }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);

  const handleTransactionClick = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleStatusChange = (transactionId: number, status: string) => {
    onTransactionStatusChange(transactionId, status);
    setSelectedTransaction(null); // Close the transaction details after status change
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{event.name}</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="my-4">
          <p className="text-sm text-gray-700">{event.description}</p>
          <p className="text-sm text-gray-500">Location: {event.location}</p>
          <p className="text-sm text-gray-500">Date: {`${formatDate(event.start_date)} - ${formatDate(event.end_date)}`}</p>
          <p className="text-sm text-gray-500">Quota: {event.quota}</p>
        </div>

        <h3 className="text-xl font-semibold mb-4">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-sm sm:text-base">Transaction ID</th>
                <th className="px-4 py-2 text-sm sm:text-base">User</th>
                <th className="px-4 py-2 text-sm sm:text-base">Status</th>
                <th className="px-4 py-2 text-sm sm:text-base">Total Price</th>
                <th className="px-4 py-2 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {event.transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <td className="px-4 py-2">{transaction.id}</td>
                  <td className="px-4 py-2">{transaction.user.email}</td>
                  <td className="px-4 py-2">{transaction.status}</td>
                  <td className="px-4 py-2">{formatCurrency(transaction.total_price)}</td>
                  <td className="px-4 py-2">
                    {transaction.status !== 'DONE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(transaction.id, 'DONE');
                        }}
                        className="text-green-500 hover:text-green-700"
                      >
                        Mark as Done
                      </button>
                    )}
                    {transaction.status !== 'REJECTED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(transaction.id, 'REJECTED');
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedTransaction && (
          <div className="mt-6 p-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold">Transaction Details</h4>
            <p>User: {selectedTransaction.user.email}</p>
            <p>Status: {selectedTransaction.status}</p>
            <p>Points Used: {selectedTransaction.point}</p>
            <p>Reward Points: {selectedTransaction.point_reward}</p>
            <p>Total Price: {formatCurrency(selectedTransaction.total_price)}</p>
            <p>Created At: {formatDate(selectedTransaction.created_at)}</p>
            {selectedTransaction.payment_proof && (
              <div>
                <p>Payment Proof:</p>
                <img src={selectedTransaction.payment_proof} alt="Payment Proof" className="w-full max-w-xs mt-2" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
