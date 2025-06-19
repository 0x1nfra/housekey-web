import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Share2, Check } from 'lucide-react';

interface MemberInviteCardProps {
  memberType: string;
  inviteMethod: 'email' | 'sms' | 'share';
  onInviteSent: (contact: string) => void;
}

const MemberInviteCard: React.FC<MemberInviteCardProps> = ({
  memberType,
  inviteMethod,
  onInviteSent
}) => {
  const [contact, setContact] = useState('');
  const [isInvited, setIsInvited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getIcon = () => {
    switch (inviteMethod) {
      case 'email':
        return Mail;
      case 'sms':
        return MessageSquare;
      case 'share':
        return Share2;
      default:
        return Mail;
    }
  };

  const getPlaceholder = () => {
    switch (inviteMethod) {
      case 'email':
        return 'Enter email address';
      case 'sms':
        return 'Enter phone number';
      case 'share':
        return 'Generate invite link';
      default:
        return 'Enter contact';
    }
  };

  const handleInvite = async () => {
    if (!contact && inviteMethod !== 'share') return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsInvited(true);
    onInviteSent(contact || 'Invite link generated');
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-gray-600" />
        </div>
        <h4 className="font-medium text-gray-900">{memberType}</h4>
      </div>

      {!isInvited ? (
        <div className="space-y-3">
          {inviteMethod !== 'share' && (
            <input
              type={inviteMethod === 'email' ? 'email' : 'tel'}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder={getPlaceholder()}
            />
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInvite}
            disabled={isLoading || (!contact && inviteMethod !== 'share')}
            className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              `Invite via ${inviteMethod === 'sms' ? 'SMS' : inviteMethod === 'email' ? 'Email' : 'Link'}`
            )}
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-700 text-sm">
          <Check size={16} />
          <span>Invitation sent!</span>
        </div>
      )}
    </motion.div>
  );
};

export default MemberInviteCard;