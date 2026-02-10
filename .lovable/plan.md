
# DarulFurkanPackages সেকশনের সব কনটেন্ট এডমিন থেকে এডিট করার পরিকল্পনা

## সমস্যা
`DarulFurkanPackages.tsx` কম্পোনেন্টে সব লেখা (লটারি ব্যানার, প্যাকেজের অন্তর্ভুক্ত তালিকা, ট্রানজিট/ডিরেক্ট ফ্লাইটের দাম ও তারিখ, ইতেকাফ প্যাকেজ, যোগাযোগ তথ্য) হার্ডকোড করা আছে। এগুলো এডমিন প্যানেল থেকে এডিট করার সুবিধা নেই।

## সমাধান
একটি নতুন ডাটাবেস টেবিল `darul_furkan_content` তৈরি করে সব কনটেন্ট সেখানে রাখা হবে এবং এডমিন প্যানেলের Packages সেকশনে একটি নতুন সাব-সেকশন "Darul Furkan Content" যোগ করা হবে।

## ধাপসমূহ

### ধাপ ১: ডাটাবেস টেবিল তৈরি
`darul_furkan_content` নামে একটি টেবিল তৈরি হবে যেখানে থাকবে:
- **লটারি ব্যানার**: শিরোনাম, সাবটাইটেল, অফারের তারিখ
- **প্যাকেজ অন্তর্ভুক্ত তালিকা**: JSON array (ভিসা, এয়ার টিকেট, হোটেল ইত্যাদি)
- **ফ্লাইট প্যাকেজ**: ট্রানজিট ও ডিরেক্ট ফ্লাইটের নাম, দাম, তারিখ (JSON array)
- **ইতেকাফ প্যাকেজ**: দিন, দাম, লেবেল (JSON array)
- **যোগাযোগ তথ্য**: ঠিকানা, ফোন নম্বর
- **সেকশন হেডার**: ব্যাজ, টাইটেল, সাবটাইটেল

### ধাপ ২: এডমিন প্যানেলে সাব-সেকশন যোগ
`AdminPackages.tsx` ফাইলে একটি নতুন ট্যাব/সেকশন "দারুল ফুরকান কনটেন্ট" যোগ হবে যেখানে এডিট করা যাবে:

- **লটারি ব্যানার সেটিংস**: শিরোনাম, সাবটাইটেল, অফারের শুরু ও শেষ তারিখ
- **প্যাকেজ ইনক্লুশন**: ডায়নামিক ফিল্ড (যোগ/মুছে ফেলা যাবে)
- **ফ্লাইট প্যাকেজ**: প্রতিটি ফ্লাইটের জন্য নাম, দাম, তারিখ, highlighted কিনা
- **ইতেকাফ প্যাকেজ**: প্রতিটির দিন, দাম, লেবেল
- **যোগাযোগ তথ্য**: ঠিকানা, ফোন নম্বর

### ধাপ ৩: ফ্রন্টএন্ড আপডেট
`DarulFurkanPackages.tsx` কম্পোনেন্ট আপডেট হবে যাতে হার্ডকোড কনটেন্টের বদলে ডাটাবেস থেকে ডাটা লোড করে।

## টেকনিক্যাল ডিটেইলস

### ডাটাবেস স্কিমা
```text
darul_furkan_content (single-row settings table)
+---------------------------+------------------+
| Column                    | Type             |
+---------------------------+------------------+
| id                        | uuid (PK)        |
| section_badge             | text             |
| section_title             | text             |
| section_title_highlight   | text             |
| section_subtitle          | text             |
| lottery_title             | text             |
| lottery_subtitle          | text             |
| special_offer_label       | text             |
| offer_dates               | text             |
| includes_title            | text             |
| includes_subtitle         | text             |
| package_inclusions        | jsonb            |
| flight_packages           | jsonb            |
| itikaf_badge              | text             |
| itikaf_title              | text             |
| itikaf_packages           | jsonb            |
| contact_title             | text             |
| contact_subtitle          | text             |
| contact_address           | text             |
| contact_phones            | jsonb            |
| discount_text             | text             |
| book_now_text             | text             |
| select_package_text       | text             |
| created_at / updated_at   | timestamptz      |
+---------------------------+------------------+
```

### JSON ফরম্যাট উদাহরণ
**flight_packages:**
```text
[
  { "type": "Transit Flight", "typeBn": "ট্রানজিট ফ্লাইট",
    "price": 135000, "flightDate": "১০ জুন ২০২৬", "highlight": false },
  { "type": "Direct Flight", "typeBn": "ডিরেক্ট ফ্লাইট",
    "price": 145000, "flightDate": "১৫ জুন ২০২৬", "highlight": true }
]
```

**itikaf_packages:**
```text
[
  { "days": 15, "daysBn": "১৫ দিন", "price": 165000, "labelBn": "১৫ দিনের ইতেকাফ" },
  ...
]
```

### এডমিন UI লেআউট
AdminPackages কম্পোনেন্টে Tabs ব্যবহার করে দুটি ট্যাব থাকবে:
1. **Packages** (বর্তমান প্যাকেজ ম্যানেজমেন্ট)
2. **Darul Furkan Content** (নতুন সাব-সেকশন)

নতুন সাব-সেকশনে Card ভিত্তিক গ্রুপিং থাকবে:
- লটারি ব্যানার সেটিংস কার্ড
- প্যাকেজ ইনক্লুশন কার্ড (ডায়নামিক add/remove)
- ফ্লাইট প্যাকেজ কার্ড (ডায়নামিক add/remove)
- ইতেকাফ প্যাকেজ কার্ড (ডায়নামিক add/remove)
- যোগাযোগ তথ্য কার্ড

### ফাইল পরিবর্তন
1. **নতুন মাইগ্রেশন**: `darul_furkan_content` টেবিল তৈরি + ডিফল্ট ডাটা insert + RLS পলিসি
2. **`src/components/admin/AdminPackages.tsx`**: Tabs যোগ এবং নতুন "Darul Furkan Content" সাব-সেকশন
3. **`src/components/DarulFurkanPackages.tsx`**: ডাটাবেস থেকে কনটেন্ট ফেচ করে রেন্ডার
