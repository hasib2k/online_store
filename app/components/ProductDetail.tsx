
"use client";

import { useState, useRef, useEffect } from 'react';

type OrderFormData = {
  name: string;
  phone: string;
  address: string;
  area: 'inside' | 'outside';
};
import styles from './ProductDetail.module.css';


export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('1 pc');
  
  const orderFormRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
    area: 'inside',
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    name: '',
    email: '',
    rating: 5,
    review: ''
  });
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const scrollToOrder = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Direct order: send order JSON to server API (saves to DB or local fallback)
  const handleDirectOrder = async () => {
    if (!validateForm()) return;

    const shipping = formData.area === 'inside' ? 60 : 120;
    const total = productPrice * quantity + shipping;

    const payload = {
      productName: 'সোনামণিদের বাংলা ইংরেজি শেখার লার্নিং এন্ড প্লেয়িং টয়',
      price: productPrice,
      originalPrice,
      quantity,
      shipping,
      total,
      area: formData.area,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'সার্ভারে অর্ডার রেকর্ড করতে সমস্যা হয়েছে।');
        return;
      }

      setOrderSubmitted(true);
      setTimeout(() => {
        setOrderSubmitted(false);
        setFormData({ name: '', phone: '', address: '', area: 'inside' });
      }, 5000);
    } catch (error) {
      console.error('Direct order failed', error);
      alert('নেটওয়ার্ক বা সার্ভার সমস্যা, পরে আবার চেষ্টা করুন।');
    }
  };

  const images = [
    '/toy07.jpg',
    '/toy02.jpg',
    '/toy03.jpg',
    '/toy04.jpg',
    '/toy05.jpg',


  ];

  // auto-advance hero carousel every 3 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  const reviews = [
    {
      name: 'হাসিব আহমেদ',
      date: '২ দিন আগে',
      rating: 5,
      title: 'প্রিমিয়াম ফ্রেশ ও লার্নিং টয়',
      text: 'টয়টি খুবই আকর্ষণীয় এবং শিক্ষামূলক। আমার সন্তান খুব আনন্দ পাচ্ছে এবং নতুন নতুন শব্দ শিখছে। অর্ডার করার পর দ্রুত ডেলিভারি পেয়েছি।',
      images: ['/image.png', '/toy02.jpg', '/toy03.jpg'],
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'তরিকুল ইসলাম তুষার',
      date: '৩ দিন আগে',
      rating: 5,
      title: 'শিশুদের জন্য পারফেক্ট',
      text: 'শিশুরা খেলতে খেলতে বাংলা ও ইংরেজি শিখছে। টয়টি খুবই টেকসই এবং সহজে ব্যবহারযোগ্য।',
      images: ['/toy04.jpg'],
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      name: 'রাশেদ খান',
      date: '৩ দিন আগে',
      rating: 5,
      title: 'সেরা মানের লার্নিং টয়',
      text: 'আমার সন্তান এখন মোবাইল ছাড়া খেলতে ও শিখতে পারছে। শিক্ষার জন্য খুবই কার্যকর।',
      images: ['/toy05.jpg', '/toy07.jpg'],
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
  ];

  const reviewPhotos = ['/review3.jpg','/review2.jpg','/review11.jpg','/review4.jpg','/review5.jpg','/review6.jpg','/review7.jpg','/review.jpg','/review13.jpg','/review12.jpg'];

  const productPrice = 990;
  const originalPrice = 1650;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(10, quantity + delta)));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Review submitted:', reviewData);
    setShowReviewForm(false);
    setReviewData({ name: '', email: '', rating: 5, review: '' });
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      address: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    const phoneRegex = /^01[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Enter valid phone number (01XXXXXXXXX)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Enter complete address';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone && !newErrors.address;
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Compute shipping and total including shipping
    const shipping = formData.area === 'inside' ? 60 : 120;
    const totalAmount = (productPrice * quantity + shipping).toFixed(2);

    // Create WhatsApp message with order details (Bangla) including shipping
    const message = `*নতুন অর্ডার ডিটেইলস:*%0A%0A` +
      `*পণ্য:* সোনামণিদের বাংলা ইংরেজি শেখার লার্নিং এন্ড প্লেয়িং টয়%0A` +
      `*মূল্য:* ৳${productPrice.toFixed(2)}%0A` +
      `*পরিমাণ:* ${quantity}%0A` +
      `*শিপিং:* ৳${shipping}%0A` +
      `*মোট মূল্য:* ৳${totalAmount}%0A%0A` +
      `*কাস্টমার তথ্য:*%0A` +
      `*নাম:* ${formData.name}%0A` +
      `*ফোন:* ${formData.phone}%0A` +
      `*ঠিকানা:* ${formData.address}%0A%0A` +
      `আমি এই অর্ডারটি কনফার্ম করতে চাই। দয়া করে নিশ্চিত করুন।`;

    // Redirect to WhatsApp
    const whatsappURL = `https://wa.me/+8801619703227?text=${message}`;
    window.open(whatsappURL, '_blank');

    // Show success message
    setOrderSubmitted(true);
    
    setTimeout(() => {
      setOrderSubmitted(false);
      setFormData({ name: '', phone: '', address: '', area: 'inside' });
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // current shipping charge based on selected area
  const shippingCharge = formData.area === 'inside' ? 60 : 120;
  const totalWithShipping = productPrice * quantity + shippingCharge;

  return (
    <div className={styles.wrapper}>
      {/* Marquee Section - Top of Page */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          <span className={styles.marqueeText}>আজই অর্ডার করুন এবং লুফে নিন আকর্ষণীয় ৪০% ছাড়!  ||</span>
          <span className={styles.marqueeText}>আজই অর্ডার করুন এবং লুফে নিন আকর্ষণীয় ৪০% ছাড়!  ||</span>
          <span className={styles.marqueeText}>আজই অর্ডার করুন এবং লুফে নিন আকর্ষণীয় ৪০% ছাড়!  ||</span>
        </div>
      </div>

      {/* Product description previously here — moved below product details */}
      {/* Static Text Section under Carousel */}
      <div className={styles.staticTextSectionVideo}>
        <h3 className={`${styles.responsiveSmallText} ${styles.videoHeading}`}>সোনামণিদের বাংলা ইংরেজি শেখার লার্নিং এন্ড প্লেয়িং টয়</h3>
      </div>
      <div className={styles.guardianReviewSection}>
    </div>
      {/* Video Preview Section (local review1.mp4) with product image carousel */}
      <div className={styles.videoPreviewSection}>
        <div className={styles['video-wrapper']}>
          <div className={styles.heroCarousel}>
            <div className={styles.carouselMain}>
              <button className={styles.carouselNav} onClick={() => setHeroIndex((heroIndex - 1 + images.length) % images.length)}>‹</button>
              <img src={images[heroIndex]} alt={`product ${heroIndex + 1}`} style={{ maxWidth: '420px', width: '100%', height: 'auto', borderRadius: 12 }} />
              <button className={styles.carouselNav} onClick={() => setHeroIndex((heroIndex + 1) % images.length)}>›</button>
            </div>
            <div className={styles.carouselThumbs}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb ${i + 1}`}
                  className={i === heroIndex ? styles.activeThumb : ''}
                  onClick={() => setHeroIndex(i)}
                />
              ))}
            </div>

            <div style={{ height: 18 }} />
          </div>
        </div>
      </div>

      {/* Static Text Section under Video - Carousel for Mobile */}
      <div className={styles.staticTextSectionVideo}>
        <h3 className={`${styles.responsiveSmallText} ${styles.videoHeading}`}>এই লার্নিং টয় দিয়ে শিশুরা যেমন খেলতে পারবে ঠিক তেমনি শিখতেও পারবে</h3>
      </div>
      <div className={styles.guardianReviewSection}>
      </div>
      

      <div className={styles.container}>
        {/* Product Detail Section */}
        <div className={styles.productSection}>

          {/* Product Info (image/gallery removed) */}
          <div className={styles.productInfo}>
            <div className={styles.badge}>স্টকে আছে</div>
            <div style={{ marginTop: 12 }}>
              <button className={styles.orderNowBtn} onClick={scrollToOrder}>
                অর্ডার করতে ক্লিক করুন  →
              </button>
            </div>
            <h1 className={styles.productTitle}>সোনামণিদের বাংলা ইংরেজি শেখার লার্নিং এন্ড প্লেয়িং টয়</h1>
            
            <div className={styles.priceSection}>
              <span className={styles.currentPrice}>৳{productPrice.toFixed(2)}</span>
              <span className={styles.originalPrice}>৳{originalPrice.toFixed(2)}</span>
              <span className={styles.discount}>৪০% ছাড়</span>
            </div>

            <div className={styles.ratingInfo}>
              <div className={styles.stars}>
                {'⭐'.repeat(5)}
              </div>
              <span className={styles.reviewCount}>৩২টি রিভিউ</span>
            </div>

            {/* Product Info - Updated Bangla Content */}
            <div className={styles.productInfoBox}>
              <h3>এই ডিভাইস কাদের জন্য?</h3>
              <ul>
                <li>যে সকল বাচ্চারা মোবাইল ছাড়া কিছুই বোঝে না তাদের জন্য</li>
                <li>যে সকল বাচ্চারা মোবাইল ছাড়া খাবার খেতে চায় না</li>
                <li>যে সকল বাচ্চারা মোবাইল, গেইম এবং টিভি নিয়ে ব্যস্ত থাকে</li>
                <li>যে সকল বাচ্চারা পড়াশোনা করতে চাই না</li>
                <li>যে সকল বাচ্চারা দেরিতে কথা বলে তাদের জন্য পারফেক্ট</li>
              </ul>
              
            </div>
            <div className={styles.productInfoBox}>
              <h3>ডিভাইস টি কেন নিবেন ?</h3>
              <ul>
                <li>খেলার ছলে পড়া শিখবে মনোযোগ বাড়বে</li>
                <li>২২৪ টি বাংলা ও ইংরেজিতে শিখবে ও বলবে</li>
                <li>বাস্তবিক সবকিছুর সাথে পরিচিত হবে এবং মেধার বিকাশ ঘটবে</li>
                <li>শিশুরা ৪ ভাবে শিখবে: ছবি দেখে, শব্দ শুনে, কালার দেখে, উচ্চারণ শুনে</li>
              </ul>
              
            </div>
          </div>
        </div>

            {/* Review carousel removed per request */}
        {/* Move product description under product details */}
        <div className={styles.productDescriptionBlock}>
          <h3>বিস্তারিত</h3>
          <h4>পণ্যের বিবরণ</h4>
          <p>
            এই লার্নিং এন্ড প্লেয়িং টয়টি শিশুদের জন্য বিশেষভাবে ডিজাইন করা হয়েছে যাতে তারা খেলার ছলে বাংলা ও ইংরেজি অক্ষর, সংখ্যা, শব্দ, ছবি, রঙ, প্রাণী, ফল, সবজি, যানবাহন, পেশা, দেহের অঙ্গ, ছড়া, কুইজ, গান ইত্যাদি শিখতে পারে।
          </p>
          <p>
            এতে রয়েছে ২২৪টি বাংলা ও ইংরেজি শব্দ ও বাক্য, ৪টি শেখার ধাপ (ছবি দেখে, শব্দ শুনে, রঙ দেখে, উচ্চারণ শুনে), এবং আনন্দদায়ক সাউন্ড ও লাইট। শিশুরা খেলতে খেলতে পড়াশোনায় আগ্রহী হবে এবং তাদের মেধার বিকাশ ঘটবে।
          </p>
          <h4>বৈশিষ্ট্য ও উপকারিতা:</h4>
          <ul>
            <li>খেলার ছলে বাংলা ও ইংরেজি শেখা</li>
            <li>২২৪টি শব্দ ও বাক্য, ৪টি শেখার ধাপ</li>
            <li>ছবি, শব্দ, রঙ ও উচ্চারণের মাধ্যমে শেখা</li>
            <li>শিশুর মনোযোগ ও মেধা বৃদ্ধি</li>
            <li>আকর্ষণীয় ডিজাইন ও টেকসই প্লাস্টিক</li>
            <li>ব্যাটারি চালিত, সহজে বহনযোগ্য</li>
            <li>শিশুরা মোবাইল থেকে দূরে থাকবে</li>
            <li>শিশুর কথা বলা ও চিন্তা শক্তি বাড়াবে</li>
          </ul>
        </div>
      </div>


      {/* ভিডিও রিভিউ - Info Box and YouTube Preview Section (below reviews) */}
      <div className={styles.staticTextSectionVideo}>
        <h3 className={`${styles.responsiveSmallText} ${styles.videoHeading}`}>ভিডিও রিভিউ</h3>
      </div>
      <div className={styles.guardianReviewSection}>
        <p>
          শিশুরা অনুকরন প্রিয়, আপনি যা করবেন তারা তাই করবে, যা বলবেন তারা তাই বলার চেস্টা করবে, আর যা শিখাবেন তাই শিখবে। তাই আপনার সোনামণিকে স্মার্ট এবং মেধাবী হতে এই শিখনীয় খেলনা তুলে দিন। অর্ডার কনফার্ম করতে নিচের তথ্য সম্পূর্ণ করে অর্ডার করুণ।
        </p>
      </div>
      <div className={styles.parentReviewVideosSection}>
        <div className={styles.videoPreviewSection}>
          <div className={styles.parentReviewVideosGrid}>
            <div className={styles.parentReviewVideo} style={{ display: 'flex', justifyContent: 'center' }}>
              <video
                src="/review1.mp4"
                controls
                muted
                loop
                playsInline
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 12 }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Review Grid with Lightbox */}
      <div className={styles.staticTextSectionVideo}>
        <h3 className={`${styles.responsiveSmallText} ${styles.videoHeading}`}>কাস্টমার রিভিউ</h3>
      </div>
      <div className={styles.guardianReviewSection}>
                <p>
          আমাদের পণ্য ও সেবা ব্যবহার করে গ্রাহকরা যে বাস্তব অভিজ্ঞতা অর্জন করেছেন, তাদের সৎ ও নির্ভরযোগ্য মতামত এখানে তুলে ধরা হয়েছে
        </p>
        {reviewPhotos.length > 0 ? (
          <>
            <div className={`${styles.photoGrid} ${!showAllPhotos ? styles.collapsed : ''}`}>
              {reviewPhotos.map((p, i) => (
                <button
                  key={i}
                  className={styles.photoItem}
                  onClick={() => { setPhotoIndex(i); setShowLightbox(true); }}
                  aria-label={`Open review photo ${i + 1}`}
                >
                  <img src={p} alt={`Review ${i + 1}`} />
                  <div className={styles.photoOverlay}>{i + 1}</div>
                </button>
              ))}
            </div>

            {reviewPhotos.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  className={styles.photoToggle}
                  onClick={() => setShowAllPhotos((s) => !s)}
                >
                  {showAllPhotos ? 'কম দেখান ↑' : 'আরও দেখুন ↓'}
                </button>
              </div>
            )}

            {showLightbox && (
              <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setShowLightbox(false)}>
                <button className={styles.lightboxClose} onClick={() => setShowLightbox(false)} aria-label="Close">✕</button>
                <button className={styles.lightboxNav} onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex - 1 + reviewPhotos.length) % reviewPhotos.length); }} aria-label="Previous">‹</button>
                <img src={reviewPhotos[photoIndex]} alt={`Lightbox review ${photoIndex + 1}`} className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
                <button className={styles.lightboxNav} style={{ right: 20 }} onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % reviewPhotos.length); }} aria-label="Next">›</button>
                <div className={styles.lightboxCounter}>{photoIndex + 1} / {reviewPhotos.length}</div>
              </div>
            )}
          </>
        ) : (
          <p>কোনো ফটো রিভিউ নেই</p>
        )}
      </div>

      {/* Order Form Section */}
        <div className={styles.orderSection} ref={orderFormRef}>
        <div className={styles.orderContainer}>
          <div className={styles.orderFormSection}>
            {orderSubmitted ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h3>Order Placed Successfully!</h3>
                <p>Order #{Math.floor(Math.random() * 900000) + 100000}</p>
                <p>We will contact you soon.</p>
                <div className={styles.orderSummary}>
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Quantity:</strong> {quantity}</p>
                  <p><strong>Shipping:</strong> ৳{shippingCharge}</p>
                  <p><strong>Total:</strong> ৳{totalWithShipping.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <>
                <h2 className={styles.orderFormTitle}>অর্ডার করুন</h2>
                <div className={styles.orderProductInfo}>
                  <h3>সোনামণিদের বাংলা ইংরেজি শেখার লার্নিং এন্ড প্লেয়িং টয় - {selectedWeight}</h3>
                  <div className={styles.orderPrice}>
                    <span className={styles.orderCurrentPrice}>৳{productPrice.toFixed(2)}</span>
                    <span className={styles.orderOriginalPrice}>৳{originalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit} className={styles.orderForm}>
                  <div className={styles.formGroup}>
                    <label>পূর্ণ নাম *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="আপনার নাম লিখুন"
                      className={errors.name ? styles.inputError : ''}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>মোবাইল নাম্বার *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className={errors.phone ? styles.inputError : ''}
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>সম্পূর্ণ ঠিকানা *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="বাসা নং, রোড নং, এলাকা, জেলা"
                      rows={4}
                      className={errors.address ? styles.inputError : ''}
                    />
                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>ডেলিভারি এলাকা *</label>
                    <div className={styles.deliveryAreaOptions}>
                      <label className={styles.deliveryAreaLabel}>
                        <input
                          type="radio"
                          name="area"
                          value="inside"
                          checked={formData.area === 'inside'}
                          onChange={() => setFormData({ ...formData, area: 'inside' })}
                        />
                        ঢাকা শহরের ভিতরে
                      </label>
                      <label className={styles.deliveryAreaLabel}>
                        <input
                          type="radio"
                          name="area"
                          value="outside"
                          checked={formData.area === 'outside'}
                          onChange={() => setFormData({ ...formData, area: 'outside' })}
                        />
                        ঢাকা শহরের বাইরে
                      </label>
                    </div>
                    <span className={styles.deliveryAreaNote}>
                      {formData.area === 'inside' ? 'ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা' : 'ঢাকার বাইরে ডেলিভারি চার্জ ১২০ টাকা'}
                    </span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>পরিমাণ</label>
                    <div className={styles.quantityControlForm}>
                      <button type="button" onClick={() => handleQuantityChange(-1)}>−</button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => handleQuantityChange(1)}>+</button>
                    </div>
                  </div>

                  <div className={styles.orderTotal}>
                    <span>শিপিং:</span>
                    <span className={styles.totalPrice}>
                      ৳{formData.area === 'inside' ? 60 : 120}
                    </span>
                  </div>
                  <div className={styles.orderTotal}>
                    <span>মোট:</span>
                    <span className={styles.totalPrice}>
                      ৳{(productPrice * quantity + (formData.area === 'inside' ? 60 : 120)).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.orderActions}>
                    <button type="button" className={styles.directOrderBtn} onClick={handleDirectOrder}>
                      সরাসরি অর্ডার করুন ╰┈➤
                    </button>
                    <button type="submit" className={styles.submitOrderBtn}>
                      WhatsApp এ অর্ডার করুন 🗨
                    </button>
                    <a href="tel:+880 1619-703227" className={styles.callOrderBtn} title="Call to place order">
                      ফোন করে অর্ডার করুন ✆
                    </a>
                  </div>

                  <p className={styles.orderNote}>
                    🛒 ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={styles.floatingButtons}>
        <a 
          href="https://wa.me/+8801619703227" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
          title="Chat on WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
            <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45zm-8.475 18.3c-1.778 0-3.52-.478-5.035-1.377l-.36-.214-3.742.98 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.887 9.885z" fill="currentColor"/>
          // svg tag properly closed above; removed stray </svg>
        </a>
        <a 
          href="tel:+880 1619-703227" 
          className={styles.callBtn}
          title="Call us"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="currentColor"/>
          </svg>
        </a>
        <a
          href="/admin/login"
          className={styles.adminLoginBtn}
          title="Admin Login"
        >
          ꗃ
        </a>
      </div>
      {/* Footer with social icons and copyright */}
      <footer className={styles.siteFooter}>
        <div className={styles.footerInner}>
          <div className={styles.socialIcons}>
            <a href="https://www.facebook.com/share/1BRiT1FXcY/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.socialIconLink}>
                <img src="/icons8-facebook.svg" alt="Facebook" className={styles.iconImg} />
            </a>
            <a href="https://www.tiktok.com/@babutoys.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={styles.socialIconLink}>
                <img src="/icons8-tiktok.svg" alt="TikTok" className={styles.iconImg} />
            </a>
            <a href="https://m.youtube.com/@BabuToysYT" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialIconLink}>
                <img src="/icons8-youtube.svg" alt="YouTube" className={styles.iconImg} />
            </a>
          </div>
          <div className={styles.copyText}>© {new Date().getFullYear()} Babu Toys - All rights reserved</div>
        </div>
      </footer>
    </div>
  );
}
