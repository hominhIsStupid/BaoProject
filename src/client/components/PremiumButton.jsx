import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PremiumButton.module.css';
import { tokenStorage } from '../../utils/api';

// ─── Bank info ───
const BANK = {
   name: 'MB Bank',
   fullName: 'Ngân hàng Quân Đội',
   accountNo: '20302079999',
   accountName: 'NGUYEN HOANG LONG',
   bin: '970422', // MB Bank BIN for VietQR
};

// ─── Top-up options ───
const TOPUP_OPTIONS = [
   { value: 50000, label: '50.000 ₫', emoji: '💰', desc: 'Dùng thử' },
   { value: 100000, label: '100.000 ₫', emoji: '💎', desc: 'Phổ biến' },
   { value: 200000, label: '200.000 ₫', emoji: '🏆', desc: 'Tiết kiệm' },
   { value: 500000, label: '500.000 ₫', emoji: '👑', desc: 'VIP' },
];

// ─── Premium plans ───
const PLANS = [
   {
      id: 'v1',
      name: 'Premium V1',
      icon: '🥈',
      price: 99000,
      priceLabel: '99.000 ₫',
      period: '/tháng',
      features: [
         { icon: '📄', text: 'Mở khóa tối đa 2 bài/ngày' },
         { icon: '📅', text: 'Tối đa 30 bài/tháng' },
         { icon: '🔖', text: 'Lưu bài đọc yêu thích' },
         { icon: '📧', text: 'Hỗ trợ email' },
      ],
      cardClass: '',
      btnClass: '',
      badge: null,
   },
   {
      id: 'v2',
      name: 'Premium V2',
      icon: '🥇',
      price: 149000,
      priceLabel: '149.000 ₫',
      period: '/tháng',
      features: [
         { icon: '📄', text: 'Mở khóa tối đa 4 bài/ngày' },
         { icon: '📅', text: 'Tối đa 60 bài/tháng' },
         { icon: '🔖', text: 'Lưu bài đọc yêu thích' },
         { icon: '⚡', text: 'Ưu tiên truy cập bài mới' },
         { icon: '📧', text: 'Hỗ trợ ưu tiên 24/7' },
      ],
      cardClass: 'planCardFeatured',
      btnClass: 'planBtnFeatured',
      badge: { text: 'Phổ biến nhất', cls: 'badgePopular' },
   },
   {
      id: 'pro',
      name: 'Premium Pro',
      icon: '👑',
      price: 299000,
      priceLabel: '299.000 ₫',
      period: '/tháng',
      features: [
         { icon: '♾️', text: 'Không giới hạn số bài đọc' },
         { icon: '🚀', text: 'Truy cập sớm bài nghiên cứu mới' },
         { icon: '📥', text: 'Tải PDF bài nghiên cứu' },
         { icon: '🔖', text: 'Lưu bài đọc yêu thích' },
         { icon: '🎯', text: 'Gợi ý bài viết cá nhân hóa' },
         { icon: '💬', text: 'Hỗ trợ VIP riêng' },
      ],
      cardClass: 'planCardPro',
      btnClass: 'planBtnPro',
      badge: { text: 'Tốt nhất', cls: 'badgeBest' },
   },
];

const HIDDEN_ROUTES = ['/login', '/register'];
const PAYMENT_TIMEOUT = 15 * 60; // 15 minutes in seconds

// ─── Helper: generate VietQR URL ───
function buildVietQRUrl(amount, addInfo) {
   const base = `https://img.vietqr.io/image/${BANK.bin}-${BANK.accountNo}-compact2.png`;
   const params = new URLSearchParams({
      amount: String(amount),
      addInfo,
      accountName: BANK.accountName,
   });
   return `${base}?${params.toString()}`;
}

// ─── Helper: format VND ───
function fmtVND(n) {
   return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

// ─── Helper: generate unique order code ───
function generateOrderCode(prefix) {
   const ts = Date.now().toString(36).toUpperCase();
   const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
   return `${prefix}${ts}${rand}`;
}

export default function PremiumButton() {
   const location = useLocation();
   const [isOpen, setIsOpen] = useState(false);
   const [activeTab, setActiveTab] = useState('topup');
   const [selectedTopup, setSelectedTopup] = useState(null);

   // Payment view state
   const [paymentView, setPaymentView] = useState(null);
   // paymentView = { type: 'topup'|'plan', amount, label, description, transferContent, orderCode }
   const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT);
   const [copied, setCopied] = useState('');
   const countdownRef = useRef(null);

   const shouldHide = HIDDEN_ROUTES.includes(location.pathname);

   // ─── Listen for external events to open modal ───
   useEffect(() => {
      const handleOpenModal = (e) => {
         const tab = e.detail?.tab || 'topup';
         setActiveTab(tab);
         setPaymentView(null);
         setIsOpen(true);
      };
      window.addEventListener('open-premium-modal', handleOpenModal);
      return () => window.removeEventListener('open-premium-modal', handleOpenModal);
   }, []);

   // ─── Close / Escape ───
   const handleClose = useCallback(() => {
      setIsOpen(false);
      // Reset payment view when closing modal
      setTimeout(() => {
         setPaymentView(null);
         setCountdown(PAYMENT_TIMEOUT);
         setCopied('');
      }, 400);
   }, []);

   const handleKeyDown = useCallback(
      (e) => {
         if (e.key === 'Escape') handleClose();
      },
      [handleClose]
   );

   useEffect(() => {
      if (isOpen) {
         document.addEventListener('keydown', handleKeyDown);
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = '';
      }
      return () => {
         document.removeEventListener('keydown', handleKeyDown);
         document.body.style.overflow = '';
      };
   }, [isOpen, handleKeyDown]);

   // ─── Countdown timer ───
   useEffect(() => {
      if (paymentView) {
         setCountdown(PAYMENT_TIMEOUT);
         countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
               if (prev <= 1) {
                  clearInterval(countdownRef.current);
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      }
      return () => {
         if (countdownRef.current) clearInterval(countdownRef.current);
      };
   }, [paymentView]);

   if (shouldHide) return null;

   const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) handleClose();
   };

   // ─── Go back from payment to selection ───
   const handleBackToSelection = () => {
      setPaymentView(null);
      setCountdown(PAYMENT_TIMEOUT);
      setCopied('');
   };

   // ─── Initiate top-up payment ───
   const handleTopup = () => {
      if (!selectedTopup) return;
      const user = tokenStorage.getUser();
      const option = TOPUP_OPTIONS.find((o) => o.value === selectedTopup);
      const orderCode = generateOrderCode('NT');
      const username = user?.username || 'guest';
      const transferContent = `${orderCode} NAP ${username}`;

      setPaymentView({
         type: 'topup',
         amount: option.value,
         label: option.label,
         description: `Nạp ${option.label} vào tài khoản`,
         transferContent,
         orderCode,
      });
   };

   // ─── Initiate plan subscription payment ───
   const handleSubscribe = (plan) => {
      const user = tokenStorage.getUser();
      const orderCode = generateOrderCode('PM');
      const username = user?.username || 'guest';
      const transferContent = `${orderCode} ${plan.id.toUpperCase()} ${username}`;

      setPaymentView({
         type: 'plan',
         amount: plan.price,
         label: plan.priceLabel,
         description: `Đăng ký ${plan.name} (${plan.priceLabel}${plan.period})`,
         transferContent,
         orderCode,
         planName: plan.name,
      });
   };

   // ─── Copy to clipboard ───
   const handleCopy = async (text, key) => {
      try {
         await navigator.clipboard.writeText(text);
         setCopied(key);
         setTimeout(() => setCopied(''), 2000);
      } catch {
         // Fallback
         const ta = document.createElement('textarea');
         ta.value = text;
         document.body.appendChild(ta);
         ta.select();
         document.execCommand('copy');
         document.body.removeChild(ta);
         setCopied(key);
         setTimeout(() => setCopied(''), 2000);
      }
   };

   // ─── Confirm payment ───
   const handleConfirmPayment = () => {
      alert(
         `✅ Cảm ơn bạn! Đơn hàng ${paymentView.orderCode} đã được ghi nhận.\n\nChúng tôi sẽ xác nhận thanh toán trong vài phút.\nNếu đã chuyển khoản đúng nội dung, tài khoản sẽ được cập nhật tự động.`
      );
      handleClose();
   };

   // ─── Format countdown ───
   const fmtTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
   };

   // ─── QR URL ───
   const qrUrl = paymentView
      ? buildVietQRUrl(paymentView.amount, paymentView.transferContent)
      : '';

   return (
      <>
         {/* ===== FLOATING BUTTON ===== */}
         <button
            id="btn-premium-upgrade"
            className={styles.floatingBtn}
            onClick={() => setIsOpen(true)}
            aria-label="Nâng cấp Premium"
         >
            <span className={styles.btnIcon}>👑</span>
            <span className={styles.btnText}>Premium</span>
         </button>

         {/* ===== MODAL OVERLAY ===== */}
         <div
            className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
            onClick={handleOverlayClick}
            aria-hidden={!isOpen}
         >
            <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Nâng cấp Premium">
               {/* ─── Header ─── */}
               <div className={styles.modalHeader}>
                  <div className={styles.modalTitleWrap}>
                     {paymentView && (
                        <button
                           className={styles.backBtn}
                           onClick={handleBackToSelection}
                           aria-label="Quay lại"
                        >
                           ←
                        </button>
                     )}
                     <span className={styles.modalLogo}>👑</span>
                     <h2 className={styles.modalTitle}>
                        {paymentView ? 'Thanh toán' : 'Nâng cấp Premium'}
                     </h2>
                  </div>
                  <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
                     ✕
                  </button>
               </div>

               {/* ─── PAYMENT VIEW ─── */}
               {paymentView ? (
                  <div className={styles.paymentView}>
                     {/* Order info bar */}
                     <div className={styles.paymentOrderBar}>
                        <div className={styles.paymentOrderInfo}>
                           <span className={styles.paymentOrderLabel}>Đơn hàng:</span>
                           <span className={styles.paymentOrderCode}>{paymentView.orderCode}</span>
                        </div>
                        <div className={`${styles.paymentTimer} ${countdown <= 60 ? styles.paymentTimerUrgent : ''}`}>
                           ⏱ {fmtTime(countdown)}
                        </div>
                     </div>

                     <p className={styles.paymentDesc}>{paymentView.description}</p>

                     {/* Two-column: QR + Bank info */}
                     <div className={styles.paymentLayout}>
                        {/* Left — QR code */}
                        <div className={styles.paymentQRSection}>
                           <p className={styles.paymentQRLabel}>Quét mã QR để thanh toán</p>
                           <div className={styles.paymentQRWrap}>
                              <img
                                 src={qrUrl}
                                 alt="Mã QR thanh toán VietQR"
                                 className={styles.paymentQRImg}
                                 onError={(e) => {
                                    // Fallback to static QR if VietQR API fails
                                    e.target.onerror = null;
                                    e.target.src = '/qr-payment.jpg';
                                 }}
                              />
                           </div>
                           <p className={styles.paymentQRHint}>
                              Mở app ngân hàng → Quét QR
                           </p>
                        </div>

                        {/* Right — Bank details */}
                        <div className={styles.paymentDetailsSection}>
                           <h4 className={styles.paymentDetailsTitle}>Thông tin chuyển khoản</h4>

                           <div className={styles.paymentDetailRow}>
                              <span className={styles.paymentDetailLabel}>Ngân hàng</span>
                              <div className={styles.paymentDetailValue}>
                                 <span>{BANK.name} — {BANK.fullName}</span>
                              </div>
                           </div>

                           <div className={styles.paymentDetailRow}>
                              <span className={styles.paymentDetailLabel}>Số tài khoản</span>
                              <div className={styles.paymentDetailValue}>
                                 <span className={styles.paymentDetailHighlight}>{BANK.accountNo}</span>
                                 <button
                                    className={`${styles.copyBtn} ${copied === 'stk' ? styles.copyBtnDone : ''}`}
                                    onClick={() => handleCopy(BANK.accountNo, 'stk')}
                                 >
                                    {copied === 'stk' ? '✓ Đã sao chép' : '📋 Sao chép'}
                                 </button>
                              </div>
                           </div>

                           <div className={styles.paymentDetailRow}>
                              <span className={styles.paymentDetailLabel}>Tên tài khoản</span>
                              <div className={styles.paymentDetailValue}>
                                 <span>{BANK.accountName}</span>
                              </div>
                           </div>

                           <div className={styles.paymentDetailRow}>
                              <span className={styles.paymentDetailLabel}>Số tiền</span>
                              <div className={styles.paymentDetailValue}>
                                 <span className={styles.paymentDetailAmount}>{fmtVND(paymentView.amount)}</span>
                                 <button
                                    className={`${styles.copyBtn} ${copied === 'amount' ? styles.copyBtnDone : ''}`}
                                    onClick={() => handleCopy(String(paymentView.amount), 'amount')}
                                 >
                                    {copied === 'amount' ? '✓ Đã sao chép' : '📋 Sao chép'}
                                 </button>
                              </div>
                           </div>

                           <div className={`${styles.paymentDetailRow} ${styles.paymentDetailRowHighlight}`}>
                              <span className={styles.paymentDetailLabel}>Nội dung CK</span>
                              <div className={styles.paymentDetailValue}>
                                 <span className={styles.paymentDetailHighlight}>{paymentView.transferContent}</span>
                                 <button
                                    className={`${styles.copyBtn} ${copied === 'ndck' ? styles.copyBtnDone : ''}`}
                                    onClick={() => handleCopy(paymentView.transferContent, 'ndck')}
                                 >
                                    {copied === 'ndck' ? '✓ Đã sao chép' : '📋 Sao chép'}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Warning */}
                     <div className={styles.paymentWarning}>
                        <span className={styles.paymentWarningIcon}>⚠️</span>
                        <p>
                           Vui lòng chuyển <strong>đúng số tiền</strong> và <strong>đúng nội dung chuyển khoản</strong> để hệ thống tự động xác nhận.
                           Không thay đổi nội dung chuyển khoản.
                        </p>
                     </div>

                     {/* Action buttons */}
                     <div className={styles.paymentActions}>
                        <button className={styles.paymentConfirmBtn} onClick={handleConfirmPayment}>
                           ✅ Tôi đã chuyển khoản
                        </button>
                        <button className={styles.paymentCancelBtn} onClick={handleBackToSelection}>
                           Hủy giao dịch
                        </button>
                     </div>
                  </div>
               ) : (
                  <>
                     {/* ─── TAB NAVIGATION ─── */}
                     <div className={styles.tabNav}>
                        <button
                           className={`${styles.tabBtn} ${activeTab === 'topup' ? styles.tabBtnActive : ''}`}
                           onClick={() => setActiveTab('topup')}
                        >
                           💳 Nạp tiền
                        </button>
                        <button
                           className={`${styles.tabBtn} ${activeTab === 'plans' ? styles.tabBtnActive : ''}`}
                           onClick={() => setActiveTab('plans')}
                        >
                           🎖️ Gói Premium
                        </button>
                     </div>

                     {/* ─── TAB CONTENT ─── */}
                     <div className={styles.tabContent}>
                        {activeTab === 'topup' && (
                           <>
                              <p className={styles.topupDescription}>
                                 Nạp tiền vào tài khoản để mua từng bài báo khoa học đơn lẻ.
                                 <br />
                                 Số dư sẽ được cộng ngay sau khi thanh toán thành công.
                              </p>

                              <div className={styles.topupGrid}>
                                 {TOPUP_OPTIONS.map((opt) => (
                                    <button
                                       key={opt.value}
                                       className={`${styles.topupCard} ${
                                          selectedTopup === opt.value ? styles.topupCardSelected : ''
                                       }`}
                                       onClick={() => setSelectedTopup(opt.value)}
                                    >
                                       <span className={styles.topupEmoji}>{opt.emoji}</span>
                                       <span className={styles.topupAmount}>{opt.label}</span>
                                       <span className={styles.topupLabel}>{opt.desc}</span>
                                    </button>
                                 ))}
                              </div>

                              <button
                                 className={styles.topupSubmitBtn}
                                 disabled={!selectedTopup}
                                 onClick={handleTopup}
                              >
                                 {selectedTopup
                                    ? `Nạp ${TOPUP_OPTIONS.find((o) => o.value === selectedTopup)?.label}`
                                    : 'Chọn mệnh giá để nạp'}
                              </button>

                              <p className={styles.footerNote}>
                                 Thanh toán qua chuyển khoản ngân hàng (VietQR).
                                 <br />
                                 Hệ thống xác nhận tự động trong vài phút.
                              </p>
                           </>
                        )}

                        {activeTab === 'plans' && (
                           <>
                              <p className={styles.plansDescription}>
                                 Chọn gói phù hợp để mở khóa và đọc các bài báo khoa học chuyên sâu.
                                 <br />
                                 Hủy bất cứ lúc nào — không ràng buộc.
                              </p>

                              <div className={styles.plansGrid}>
                                 {PLANS.map((plan) => (
                                    <div
                                       key={plan.id}
                                       className={`${styles.planCard} ${
                                          plan.cardClass ? styles[plan.cardClass] : ''
                                       }`}
                                    >
                                       {plan.badge && (
                                          <span className={`${styles.planBadge} ${styles[plan.badge.cls]}`}>
                                             {plan.badge.text}
                                          </span>
                                       )}
                                       <span className={styles.planIcon}>{plan.icon}</span>
                                       <h3 className={styles.planName}>{plan.name}</h3>
                                       <div className={styles.planPrice}>
                                          <span className={styles.priceValue}>{plan.priceLabel}</span>
                                          <span className={styles.pricePeriod}>{plan.period}</span>
                                       </div>
                                       <ul className={styles.planFeatures}>
                                          {plan.features.map((feat, i) => (
                                             <li key={i}>
                                                <span className={styles.featureIcon}>{feat.icon}</span>
                                                {feat.text}
                                             </li>
                                          ))}
                                       </ul>
                                       <button
                                          className={`${styles.planBtn} ${
                                             plan.btnClass ? styles[plan.btnClass] : ''
                                          }`}
                                          onClick={() => handleSubscribe(plan)}
                                       >
                                          Đăng ký ngay
                                       </button>
                                    </div>
                                 ))}
                              </div>

                              <p className={styles.footerNote}>
                                 Giá chưa bao gồm VAT. Thanh toán qua chuyển khoản ngân hàng.
                                 <br />
                                 Bạn có thể hủy gói bất cứ lúc nào trong phần Cài đặt tài khoản.
                              </p>
                           </>
                        )}
                     </div>
                  </>
               )}
            </div>
         </div>
      </>
   );
}
