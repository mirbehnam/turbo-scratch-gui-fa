# شخصی‌سازی‌های TurboWarp در my-develop

## انتقال کتابخانه، دیالوگ و اتوماسیون — ۳ نوامبر ۲۰۲۶

نام فارسی رسانه‌ها و جست‌وجوی دوزبانه، دیالوگ جمع‌وجور ایجاد قطعه بدون فوکوس
خودکار، تأیید خروج چندزبانهٔ Windows و workflowهای CI دستی/ریلیز/بازیابی سرور
اضافه شده‌اند. قراردادها، فایل‌ها و نتیجهٔ آزمون‌ها در
[docs/LIBRARY_DIALOG_RELEASE.md](docs/LIBRARY_DIALOG_RELEASE.md) آمده‌اند.
RTL داخلی توربو طبق درخواست صاحب پروژه بدون تغییر است.

## فونت و دکمه‌های رابط

منوی تنظیمات تم و زیرمنوهای آن برای فارسی و عربی ترجمه شده‌اند؛ رنگ اصلی
پیش‌فرض آبی است و انتخاب ذخیره‌شدهٔ کاربر حفظ می‌شود. موارد باقی‌مانده برای
انتقال از پروژهٔ اصلی در [docs/NOT_YET_PORTED.md](docs/NOT_YET_PORTED.md) فهرست شده‌اند.

فونت محلی BYekan به همان بخش‌های رابط پروژهٔ اصلی، از جمله دسته‌های بلاک‌ها،
منتقل شده است. دکمهٔ مشاهدهٔ صفحهٔ پروژه از ورودی اپ حذف شده و Advanced در
فارسی و عربی، شامل متن داخل دیالوگ، ترجمه دارد. کد اختصاصی دکمهٔ صفحهٔ پروژه
حذف شده و کد مشترک آن با player/اشتراک‌گذاری حفظ شده است. دکمهٔ Addons موقتاً
مخفی است و کد آن باقی است؛ گزینه‌های نام کاربری و متغیرهای ابری از منو حذف
شده‌اند. شرح فایل‌ها و تفاوت گزینه‌های ذخیره در
[docs/PERSIAN_CUSTOMIZATIONS.md](docs/PERSIAN_CUSTOMIZATIONS.md) آمده است.

این مخزن مستقل، از `https://github.com/mirbehnam/turbo-scratch-gui-fa` در پوشهٔ
`turbo-scratch-editor-fa` کلون شده است. نسخهٔ مبنا `3.2.37` و کامیت آن
`54043ccbcfd795183af2b1dfd299b4e9ab09f6ff` است. پروژهٔ کناری `scratch-editor-fa`
در این انتقال تغییر نکرده است.

همهٔ تغییرات سفارشی باید فقط روی **`my-develop`** انجام شوند. برنچ `develop`
روی کامیت اصلی `origin/develop` باقی می‌ماند. هنگام به‌روزرسانی، تغییرات اصلی
را با حفظ قراردادهای زیر به `my-develop` بیاورید.

## فهرست تمام شخصی‌سازی‌های منتقل‌شده

| شخصی‌سازی | فایل‌های اصلی | رفتار |
| --- | --- | --- |
| بارگذاری پروژه از کلاینت اندروید | `src/lib/android-bridge.js`، `src/lib/sb-file-uploader-hoc.jsx` | متدهای `AndroidScratchLoadProject()` و `AndroidScratchLoadProjectUrl(url, filename)` و callbackهای اختیاری `projectLoaderReady()` و `projectLoadStarted()` حفظ شده‌اند. فایل میزبان از مسیر واقعی بارگذاری TurboWarp عبور می‌کند و عنوان آن حفظ می‌شود. |
| چند بارگذار هم‌زمان TurboWarp | همان دو فایل | یک ورودی عمومی به آخرین بارگذار زنده هدایت می‌شود. خروج یک نمونه، بریج نمونهٔ باقی‌مانده را حذف نمی‌کند. یک بارگذاری بومی نباید چند بار به VM برسد. |
| ذخیرهٔ پروژه و اسپرایت در اندروید | `android-bridge.js`، `download-blob.js`، `src/containers/sb3-downloader.jsx` | `.sb3` با `beginSave/appendChunk/finishSave` و `.sprite3` با `beginSpriteSave/appendSpriteChunk/finishSpriteSave` منتقل می‌شود؛ تکه‌های base64 حداکثر ۲۶۲۱۴۴ کاراکترند. سایز اصلی اسپرایت به کلاینت اعلام می‌شود. مسیر دانلود معمول مرورگر حفظ است. |
| سازگاری با User-Agent ویندوز کلاینت | بارگذار پروژه و `sb3-downloader.jsx` | وجود `AndroidProjectSaver`، فایل‌پیکر File System Access مرورگر را کنار می‌گذارد تا بازکردن و ذخیره به میزبان اندروید برسد. تشخیص صرفاً متکی به User-Agent نیست. |
| ورودی بومی عددی | `android-bridge.js`، `src/lib/tw-lazy-scratch-blocks.js` | با وجود `AndroidScratchTextInput`، ورودی عددی از ویرایشگر متن استفاده می‌کند و کیپد اضافی Scratch باز نمی‌شود. رفتار معمول دسکتاپ حفظ است. |
| دیالوگ نام‌گذاری و پیام جدید | `src/components/prompt/prompt.jsx`، `prompt.css`، `src/components/modal/modal.jsx` | در میزبان بومی، دیالوگ پیش از فوکوس ورودی رسم می‌شود؛ لمس پس‌زمینه آن را نمی‌بندد و ارتفاع به‌جای `vh` نسبت به overlay محاسبه می‌شود. تأیید ورودی بالای کیبورد فقط متن را ثبت می‌کند؛ ساخت پیام/متغیر با OK خود دیالوگ انجام می‌شود. |
| بیلد اندروید | `scripts/build-android.mjs`، `package.json` | production، مسیرهای نسبی، بدون source map؛ `build/index.html` مستقیماً ویرایشگر را باز می‌کند تا با URL فعلی کلاینت سازگار باشد. بریج‌ها و کامل‌بودن رسانه‌ها کنترل می‌شوند. |
| دو بستهٔ ویندوز | `scripts/build-windows.mjs`، `scripts/run-with-retry.cjs`، `desktop/main.cjs`، `desktop/installer.iss` | همان فایل‌های اندروید در Electron x64 و ia32 قرار می‌گیرند و Inno Setup دو نصب‌کنندهٔ دارای شمارهٔ نسخه می‌سازد. هویت برنامه و مسیر نصب `TurboWarp FA` از Scratch farsi جداست. آیکون TurboWarp حفظ شده است. |
| اجرای فایل‌های محلی در ویندوز | `desktop/main.cjs` | یک سرور loopback داخل فرایند Electron فایل‌های بسته را ارائه می‌کند تا fetch فونت‌ها نیز محلی کار کند. دسترسی Node در renderer خاموش و sandbox و context isolation فعال است. بستن پنجره فرایند برنامه را می‌بندد. |
| نصب با حداقل مراحل | `desktop/installer.iss` | صفحه‌های Welcome/Next/Finish و انتخاب مسیر حذف شده‌اند؛ میان‌برها، اجرای پس از نصب و حذف نصب حفظ‌اند. |
| کتابخانهٔ رسانهٔ آفلاین | `src/lib/offline-asset-url.js`، `src/lib/storage.js`، `src/containers/library-item.jsx` | تصاویر پیش‌نمایش، چرخش لباس‌ها، پخش پیش‌نمایش صدا و افزودن واقعی رسانه از فایل‌های محلی استفاده می‌کنند. برای هر thumbnail فایل Blob جدید ساخته نمی‌شود. |
| نگهداری و اعتبارسنجی رسانه‌ها | `scripts/download-assets.mjs`، `scripts/lib/library-assets.mjs`، `scripts/verify-offline-assets.mjs`، `src/lib/libraries/offline-assets.json`، `webpack.config.js` | نیازمندی‌های هر چهار کاتالوگ استخراج می‌شوند؛ فقط فایل‌های غایب یا خراب دانلود می‌شوند. محتوای تک‌تک فایل‌ها با MD5 نامشان سنجیده می‌شود. فایل‌ها در خروجی فقط یک بار در `static/assets` قرار می‌گیرند. |
| حذف کامل آموزش داخلی | `scripts/tutorial-removal-audit.json`، `scripts/verify-tutorial-removal.mjs`، reducerها و GUI | کد کارت‌ها، tips library، decks، پارامتر tutorial، CSS و تصاویر اختصاصی آموزش از سورس حذف شده‌اند. ۱۵۰۰ فایل با بررسی ارجاع و هش حذف شده‌اند؛ اجزای مشترک و کتابخانه‌های رسانه حفظ‌اند. [گزارش و فهرست تک‌تک حذف‌ها](docs/TUTORIAL_REMOVAL.md) |
| جاگرفتن عرض ویرایشگر در WebView اندروید | `src/playground/index.ejs`، `test/android-viewport.test.mjs` | پیش از رسم ویرایشگر در میزبان اندروید، viewport روی `width=1024, user-scalable=no` تنظیم می‌شود تا WebView بتواند کل عرض رابط را مقیاس کند. تشخیص با origin دقیق یا بریج بومی است؛ viewport معمول ویندوز و مرورگر دسکتاپ حفظ می‌شود. |
| گربهٔ پیش‌فرض Scratch | `src/lib/default-project/` | پروژهٔ تازه با گربهٔ اصلی اسکرچ، دو حالت و صدای میو باز می‌شود؛ هر سه فایل همراه برنامه کش شده‌اند. |
| فارسی و انتخاب سه‌زبانه | `supported-locales.js`، `detect-locale.js`، reducer زبان، `menu-bar/language-menu.jsx` | پیش‌فرض فارسی و RTL است؛ انتخاب معتبر کاربر حفظ می‌شود. دکمهٔ مستقل زبان بین تنظیمات و فایل، دیالوگ فارسی/عربی/انگلیسی را باز می‌کند و زبان از داخل تنظیمات خارج شده است. |
| حذف زبان‌های دیگر و بازخورد | `scripts/loaders/`، `scripts/prune-locales.mjs`، منو و ترجمه‌های Addon | فقط سه زبان در ترجمه‌های رابط، بلوک‌ها و Paint بسته‌بندی می‌شوند؛ ۳۴ فایل ترجمهٔ اضافی Addon از سورس حذف شده است. دکمهٔ TurboWarp Feedback، CSS آن و لینک بازخورد پایین صفحه حذف شده‌اند. [جزئیات](docs/PERSIAN_CUSTOMIZATIONS.md) |

ورودی شناور بالای کیبورد در خود کلاینت اندروید پیاده شده است؛ کد اندروید یا
assets برنامهٔ اندروید در این فعالیت تغییر نکرده‌اند. جزئیات دقیق قرارداد
متدهای بومی در [ANDROID_BRIDGE.md](ANDROID_BRIDGE.md) آمده است.

## دارایی‌های آفلاین

کاتالوگ فعلی ۱۳۰۴ فایل یکتا برای اسپرایت، لباس، پس‌زمینه و صدا نیاز دارد.
۱۳۰۰ فایل از پوشهٔ `static/assets` پروژهٔ قبلی کپی و صحت محتوایشان بررسی شد.
چهار فایل زیر از CDN اصلی Scratch دریافت و MD5 آن‌ها تأیید شد:

| نام | فایل |
| --- | --- |
| Dango | `b4ab6b3b69de1bc3ed6a94ace172a0b0.svg` |
| Dango Cat | `927d672925e7b99f7813735c484c6922.svg` |
| Neigh Pony | `1d9b10ec091c86e27e69854b933bc90d.svg` |
| Turbo Robot | `9546f547835649c415959fc86c9a1717.svg` |

این فایل‌ها در `static/assets/` نگهداری می‌شوند و فهرست مرتب آن‌ها در
`src/lib/libraries/offline-assets.json` است. فایل‌های مشترک بدون تغییر محتوا
منتقل شده‌اند؛ نام‌ها، تعداد آیتم‌ها و تعریف چهار کاتالوگ TurboWarp تغییر
نکرده است.

تمام رسانه‌های **کتابخانهٔ داخلی** آفلاین‌اند. پروژه‌های آنلاین، فایل‌های
غیرموجود در بسته، فونت‌های سفارشی پروژه‌های آنلاین، سرویس ابری، تبدیل متن به
گفتار و وب‌سایت افزونه‌ها همچنان رفتار شبکه‌ای معمول خود را دارند. مسیر
آنلاین برای یک دارایی خارج از فهرست محلی حفظ شده است؛ آیتم موجود در کتابخانه
نباید برای بارگذاری یا پیش‌نمایش به CDN نیاز داشته باشد.

## دستورها

با Node.js 24 در ریشهٔ این پروژه:

```powershell
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
npm.cmd ci --include=dev --foreground-scripts --registry=https://registry.npmjs.org
npm.cmd run build:android
```

`build:android` بیلد اندروید و هر دو نصب‌کنندهٔ ویندوز را می‌سازد. رسانه‌ها
همراه سورس هستند و در هر بیلد دوباره دانلود نمی‌شوند. خروجی‌ها:

- اندروید: `build/`؛ محتوای آن را هنگام انتقال در assets/build کلاینت قرار دهید.
- ویندوز: `build-windows/installers/TurboWarp-FA-3.2.37-win-x64-Setup.exe` و
  `TurboWarp-FA-3.2.37-win-ia32-Setup.exe`؛ شماره با نسخهٔ package تغییر می‌کند.

بسته‌بندی دوبارهٔ ویندوز از بیلد موجود:

```powershell
npm.cmd run build:windows
```

بعد از تغییر کاتالوگ‌ها، دریافت فقط فایل‌های لازم و کنترل خروجی:

```powershell
npm.cmd run assets:download
npm.cmd run build:android
npm.cmd run build:verify-offline
```

برای استفادهٔ مجدد از فایل‌های موجود در پوشه‌ای دیگر:

```powershell
npm.cmd run assets:download -- --source-dir "C:\path\to\existing\assets"
```

اسکریپت دانلود پراکسی یا میرور اجباری ندارد و از سرور اصلی استفاده می‌کند.
پس از آپدیت، فهرست محلی و فایل‌های رسانهٔ جدید را همراه کد نگه دارید.

## محدودهٔ انتقال

VM، کامپایلر، قابلیت‌های افزونه‌ها و رفتار درگ صحنه همان رفتار TurboWarp را دارند.
فونت رابط، نام فارسی کتابخانه‌ها، دیالوگ‌ها و اتوماسیون مطابق بخش‌های جدید همین
سند سفارشی شده‌اند. تنها موارد [فهرست باقی‌مانده](docs/NOT_YET_PORTED.md) هنوز
منتقل نشده‌اند. ارتقاهای بعدی نباید بدون درخواست صاحب پروژه دامنه را گسترش دهند.

## اعتبارسنجی

- ۷۸ تست واحد؛ شامل بریج، رسانهٔ آفلاین، کتابخانهٔ فارسی، خروج ویندوز، تصمیم‌گیری ریلیز و بازیابی سرور، حذف آموزش، viewport، تم و زبان‌ها.
- ESLint فایل‌های تغییرکردهٔ رابط، storage و تنظیمات webpack.
- کنترل وجود و MD5 همهٔ ۱۳۰۴ فایل، پیش از کامپایل و در خروجی نهایی.
- تست عملی مرورگر با مسدودکردن اینترنت برای کتابخانه‌های اسپرایت، لباس،
  پس‌زمینه و صدا؛ مسیر مرورگر دسکتاپ و origin شبیه‌سازی‌شدهٔ Android WebView.
- اجرای دو بستهٔ Windows x64 و ia32 و کنترل خروج کامل با بسته‌شدن پنجره.
- مقایسهٔ SHA256 تمام فایل‌های وب بسته‌های ویندوز با بیلد اندروید.

خروجی فعلی شامل ۱۶۹۰ فایل، با حجم حدود ۷۰٫۹۵ مگابایت باینری و بدون source map
است. تمام فایل‌های وب داخل هر دو بستهٔ ویندوز از لحاظ SHA256 با بیلد اندروید
یکسان‌اند. برای قفل موقت فایل در rcedit یا Inno Setup، بسته‌بندی چند بار با
فاصلهٔ کوتاه تلاش می‌کند و در صورت شکست نهایی خطا می‌دهد.

آزمون با origin و بریج شبیه‌سازی‌شده، جای آزمون روی دستگاه واقعی را کامل
نمی‌گیرد. APK ساخته یا نصب نشده و بیلد جدید خودکار جایگزین assets کلاینت
اندروید نشده است.

## حذف آموزش — ۳ نوامبر ۲۰۲۶

نقطهٔ بازگشت پیش از حذف، کامیت `12f23d4` روی `my-develop` است؛ این کامیت
بریج‌ها، بیلدها و رسانه‌های آفلاین را در وضعیت سالم ثبت می‌کند. برنچ develop
همچنان روی کامیت اولیهٔ فورک باقی مانده است.

۱۵۰۰ فایل آموزشی (۱۴۷۶ تصویر/آیکون و ۲۴ فایل کد/استایل) با حجم سورس حدود
۵۹٫۲۲ MiB حذف شدند. TurboWarp از قبل decks خالی و منوی پنهان داشت؛ بنابراین
این مقدار، کاهش حجم سورس است و میزان کاهش بیلد به‌صورت جداگانه اندازه‌گیری
می‌شود. فهرست کامل حذف‌ها و تغییر بخش‌های باقی‌مانده در
[docs/TUTORIAL_REMOVAL.md](docs/TUTORIAL_REMOVAL.md) ثبت است.

پس از حذف، بیلد از ۷۶٫۵۷ به ۷۶٫۴۳ MiB رسید. هر ۱۴۵۰ فایل غیرآموزشی که پیش از
حذف در `build/static/assets` بود، با SHA256 یکسان حفظ شده است. هر دو بستهٔ ویندوز
با خروجی اندروید یکسان‌اند و آزمون کتابخانه‌های آفلاین، بریج، دیالوگ پیام جدید
و اجرای Electron در هر دو معماری پاس شد.

محدودیت‌های ابزارهای موجود: فایل `menu-bar.jsx` از قبل ۲۲ خطای lint مرتبط با
propهای بلااستفاده، importهای قدیمی و قالب‌بندی دارد؛ همهٔ این خطاها در نسخهٔ
پیش از حذف نیز وجود دارند و خطای جدیدی اضافه نشده است. فایل‌های دیگرِ تغییرکرده
در حذف آموزش lint را پاس می‌کنند. دستور `i18n:src` نیز با شناسهٔ تکراری قدیمی
`gui.menuBar.downloadToComputer` در `menu-bar.jsx` و `tw-save-status.jsx` متوقف
می‌شود؛ این دو تعریف در نقطهٔ بازگشت هم وجود دارند. اصلاح این موارد خارج از
درخواست حذف آموزش است.

## مقیاس صفحهٔ اندروید

تنظیم viewport به‌محض پردازش head و فقط در صفحهٔ ویرایشگر فعال می‌شود؛ منتظر
بارگذاری React نمی‌ماند. وجود `AndroidProjectSaver` یا `AndroidScratchTextInput`
یا origin دقیق `https://appassets.androidplatform.net` میزبان بومی را مشخص می‌کند.
کلاینت با User-Agent ویندوز نیز همین رفتار را دارد. صفحات player/fullscreen و
دسکتاپ عادی viewport قبلی را حفظ می‌کنند.

این تنظیم با `useWideViewPort=true` و `loadWithOverviewMode=true` فعلی کلاینت
هماهنگ است. ارتفاع طبیعی ویرایشگر و اسکرول عمودی آن تغییر نکرده‌اند؛ هدف جلوگیری
از بیرون‌ماندن بخشی از عرض رابط است. کد کلاینت اندروید یا assets آن تغییر نکرده است.

در آزمون موبایل با فضای ۸۲۰×۳۸۰ و User-Agent ویندوز، عرض قابل‌مشاهدهٔ مجازی از
۸۲۰ به ۱۰۲۴ رسید و با عرض محتوای رابط برابر شد؛ مقیاس خودکار حدود ۰٫۸ شد.
در دسکتاپ viewport و مقیاس قبلی حفظ شدند. ۵۴ تست واحد، آزمون بریج/پیام جدید،
بیلد هر دو معماری Windows، اجرای Electron و تطبیق فایل‌های بسته‌ها پاس شد.
این اندازه‌گیری با شبیه‌سازی موبایل انجام شده و آزمون روی WebView دستگاه واقعی
هنوز انجام نشده است.

## ابزار داخلی HTML

قابلیت File → Package project به دیالوگ داخلی سه‌زبانه با ورود خودکار پروژهٔ جاری،
خروجی فقط HTML و ذخیره/اشتراک‌گذاری Android و Windows تبدیل شده است.
معرفی و انتخاب پروژهٔ سایت Packager در این رابط وجود ندارد.
جزئیات منبع، قراردادهای امنیتی پل‌ها، محدودیت‌ها و بیلد در
[docs/EMBEDDED_PACKAGER.md](docs/EMBEDDED_PACKAGER.md) است.

## پریست، پخش مستقیم و بارگذاری پروژهٔ صف‌شده

پیش‌فرض افزونهٔ Editor find bar خاموش و Auto-hiding block palette روشن است.
overrideها در src/addons/addons.js و pull.js ثبت شده‌اند تا بازتولید افزونه‌ها آن‌ها
را حفظ کند. انتخاب صریح ذخیره‌شدهٔ کاربر همچنان بر پیش‌فرض اولویت دارد.

ابزار HTML دو پریست «بالاترین کیفیت» و «کیفیت متوسط» دارد؛ گزینه‌های حرفه‌ای زیر
«تنظیمات پیشرفته» به‌صورت بسته هستند و لودینگ ساخت موفق حداقل پنج ثانیه است.
«اجرای مستقیم» خروجی موجود را با دکمه‌های آیکون‌دار بستن/رفرش پخش می‌کند؛ اندروید
از WebView مستقل بدون بریج و ویندوز/مرورگر از iframe ایزوله استفاده می‌کنند.

فرمان پروژهٔ ذخیره‌شدهٔ اندروید که هنگام بارگذاری اولیه می‌رسد تا آماده‌شدن حالت
SHOWING در صف می‌ماند؛ این اصلاح خطای Could not load project در مسیر خانه را رفع
می‌کند. شرح کامل و آزمون‌ها در docs/EMBEDDED_PACKAGER.md است.

## کنترل‌های پخش و نوار کناری

در همهٔ پریست‌ها، کنترل‌های stop/pause/fullscreen داخل HTML خاموش‌اند. انتخاب پریست
و تیک‌های Advanced از یک store استفاده می‌کنند. نوار افقی پخش حذف شده است؛ در اندروید
همان نوار سمت چپ هنگام پخش HTML باقی می‌ماند، خانه و اسلایدر مخفی و بستن/رفرش اضافه
می‌شوند. صفحه‌کلید روی HTML فعال کار می‌کند و بستن، همان ویرایشگر قبلی را برمی‌گرداند.
جزئیات و نقاط بازگشت در docs/EMBEDDED_PACKAGER.md ثبت شده‌اند.

## Category click as the palette default

Auto-hiding block palette remains enabled by default; its `toggle` setting now
uses `category` (Category click). This override is applied in `src/addons/pull.js`
as well as the generated manifest so updating addons preserves the default.
Explicit previously saved user settings are preserved.

The embedded packager also accepts `autobuild=high` for the original Scratch
editor's separate high-quality player. It resets options to the high preset,
builds automatically after project import and reports failures to the parent.
Local-file Electron hosting uses an opaque-origin postMessage target only for
`file:` pages and still checks the exact parent/frame source on receipt.

## Mobile category taps

Hover presets cannot rely on desktop mouse-enter events on touchscreens. A
capture-phase touchend adapter in `src/addons/mobile-category-tap.js` selects and
opens/closes the touched category for the saved hover/cathover presets. The
category-click preset retains Blockly's normal touch handling. Multitouch, active
workspace drags, disabled addons and all real mouse events keep their normal
paths. The adapter cancels only a handled category touch to prevent duplicate
selection/synthetic clicks. `pull.js` reapplies this integration and fails clearly
if upstream changes its toolbox integration point. Browser touch tests reproduced
a closed palette before the fix and confirmed short-tap open/repeated-tap close
afterward; desktop hover/click behavior was checked separately.

Validation: 88 unit tests passed. Browser tests reproduced the saved hover-mode
short-tap failure and verified tap-to-open/tap-to-close afterward; desktop mouse
behavior was unchanged. Persian/Arabic/English packaging tests still verify the
manual >=5s loading display, exact medium/high controls, sandbox playback,
refresh and editor preservation. The default category-click mode was also tested
with touch and mouse. Android/Windows outputs were rebuilt and the Android raw
assets updated; both Windows architectures contain the same web files as build/.


Android HTML Save now uses the host's private My Projects library rather than
Downloads; its acknowledged response selects a new fa/ar/en Saved in My Projects
message. Windows/browser behavior remains unchanged. See docs/EMBEDDED_PACKAGER.md
and the Android client's docs/PACKAGED_HTML_EXPORT.md for storage/playback ownership.

## Quality playback, restore translations and Persian branding — 2026-11-04

Added the toolbar quality-run button next to the project title (on its visual left
in Persian). It uses the local packager high preset, skips the manual five-second
wait and cleans up the builder/player. The abortable export path is shared with
the existing manual packager. The editor VM and project remain unchanged.

Translated Restore points menu, dialog, intervals, errors, row actions and delete
confirmation into Persian/Arabic; fixed the duplicated restore-load message ID.
Translated both states of the 60 FPS toggle and Advanced Settings menu. Interface
explanations use localized Scratch Farsi branding, preserving URLs and licenses.
Added the generated transparent Persian toolbar wordmark as an inert first item;
its exact generation prompt and provenance are in docs/TOOLBAR_BRANDING.md.

Validation: 91 unit tests passed. Browser tests in fa/ar/en covered real restore
snapshots/actions, both FPS states, Advanced explanations, branding/position,
automatic quality playback, refresh and cleanup; automatic build-to-playback took
under one second for the default project. Android assets and both Windows
installers were rebuilt with npm run build:android. Changed files introduced no
new lint errors; menu-bar.jsx retains 19 pre-existing errors (HEAD had 21).
The global i18n:src command remains blocked by the existing duplicate
gui.menuBar.downloadToComputer ID; runtime locale coverage tests pass.

Real Electron validation also passed for the new quality-run button on x64 and
ia32: file-origin messaging, automatic offline build, isolated HTML playback,
refresh and cleanup. Native Android packager/library tests passed on the connected
Android 16 device; the combined APK was installed with both updated web engines.

## SVG rendering in isolated desktop playback

Manual direct play and the quality-run player now create their HTML Blob URL
inside a sandboxed opaque-origin bootstrap. This allows the Scratch SVG renderer
to access its own nested SVG sandbox while preventing access to the editor and
its native bridges. The old opaque outer sandbox caused `contentDocument` to be
null for the SVG renderer's iframe. Android's separate native player is unchanged.

Validation: all 92 unit tests and lint on the changed player files passed.
Offline Chrome and the actual x64/ia32 Electron applications rendered a text SVG
in manual and quality playback; refresh was checked in both environments. The
player remained cross-origin from the editor and had no desktop/native bridge.
Both Windows installers were rebuilt. Validation used a synthetic SVG, not the
user’s specific project.

## Light default and network audit

Theme detection now uses the light default independently of system dark/high-contrast
preferences. Explicit stored choices and legacy light/dark values remain supported;
the default accent is unchanged. See docs/NETWORK_AUDIT.md for conditional network
endpoints and the limits of the observed offline tests. Unit tests, browser tests
under dark OS preference and a Windows Electron startup check passed.
