# ابزار داخلی ساخت HTML

این قابلیت فقط روی `my-develop` توسعه داده شده است. نقطهٔ بازگشت پیش از شروع:
`bde9376` در این مخزن و `5eb399a` در کلاینت اندروید `farsiscratch`.
برنچ `develop` و مخزن مجاور `scratch-editor-fa` تغییر نکرده‌اند.

## رفتار رابط

- «فایل ← ساخت خروجی پروژه» دیالوگ داخلی به سبک اسکرچ را باز می‌کند.
- پروژهٔ جاری با `vm.saveProjectSb3` به یک نسخهٔ موقت تبدیل می‌شود؛ فایل روی
  پروژهٔ اصلی نوشته نمی‌شود و انتخاب یا بارگذاری دستی پروژه لازم نیست.
- بخش معرفی TurboWarp Packager، لینک‌های تبلیغی آن، Select Project، ورودی ID/URL،
  انتخاب SB3 و دکمهٔ Load Project نمایش داده نمی‌شوند.
- فقط خروجی HTML مجاز است، حتی هنگام بارگذاری تنظیمات ذخیره‌شدهٔ Packager.
  انتخاب ZIP، Electron، NW.js، macOS، Linux و Windows در رابط وجود ندارد.
- تنظیمات اجرا، صحنه، کنترل‌ها، ظاهر، ورودی، متغیرهای ابری و پیشرفته باقی می‌مانند.
  عنوان/زبان/حالت روشن یا تاریک از ویرایشگر گرفته می‌شوند. زبان‌ها فقط فارسی، عربی
  و انگلیسی هستند و فونت BYekan محلی است.
- پس از ساخت، دیالوگ نتیجه نام فایل، ذخیره، اشتراک‌گذاری و توضیح HTML را نشان می‌دهد.
  HTML مستقیماً در ویرایشگر اسکرچ باز نمی‌شود؛ کاربر باید SB3 را برای ویرایش نگه دارد.
  متن زیر دکمه‌ها طبق متن صاحب پروژه، دربارهٔ اجرای روان‌تر و اشتراک‌گذاری HTML
  و مناسب‌بودن آن برای اجرا و نه ویرایش در اسکرچ است.
- خطای ذخیره/اشتراک‌گذاری خروجی ساخته‌شده را از بین نمی‌برد؛ امکان تلاش مجدد هست.

## کد و مجوز

منبع `vendor/packager` از TurboWarp/packager با کامیت ثابت
`c115bdf525c5f49f0fb689a21b335ccb70fc22d2` و مجوز MPL-2.0 گرفته شده است.
`UPSTREAM.md` و LICENSE حفظ شده‌اند و کنار خروجی داخلی نیز کپی می‌شوند.
این کد نسخهٔ مرورگری رسمی را درون برنامه قرار می‌دهد؛ API مخصوص Node را در مرورگر
اجرا نمی‌کند. Svelte 3 و loaderهای CSS/Style با alias مستقل نصب شده‌اند تا وابستگی‌های
قدیمی رابط اصلی تغییر نکنند. VM، Render و Audio خروجی از وابستگی‌های همین مخزن ساخته می‌شوند.

والد در `tw-packager-integration-hoc.jsx` و `components/packager-modal` است؛
`packager-snapshot.js` یک نسخهٔ موقت IndexedDB را با شناسهٔ مالک نگه می‌دارد و هنگام
بستن پاک می‌کند. لغو/بازکردن سریع نباید نسخهٔ متعلق به دیالوگ بعدی را پاک کند.
پیام‌های iframe هم origin و هم window مبدأ را کنترل می‌کنند. تنظیمات و فایل‌های
انتخاب‌شدهٔ Packager از ذخیره‌سازی محلی خود ابزار استفاده می‌کنند؛ کلید پروژه براساس
نام آن است. این نسخهٔ موقت جایگزین Restore point یا ذخیرهٔ عادی پروژه نیست.

## ذخیره و اشتراک‌گذاری

`packager-export.js` فایل HTML یا JSON تنظیمات را در قطعات 192 KiB می‌فرستد و
برای هر قطعه منتظر پاسخ Native می‌ماند. اندازه، نوع، نام فایل و کامل‌بودن انتقال
در Native کنترل می‌شوند. مقصد فایل ذخیره‌شده Downloads است؛ فایل هم‌نام بازنویسی نمی‌شود.

### اندروید

کلاینت به `editor/PackagedExportBridge.kt` نیاز دارد. پل `AndroidPackagedExport`
با WebViewCompat Web Message Listener فقط origin محلی appassets و فقط main frame
زیر `assets/turbobuild/` را می‌پذیرد. iframe تنظیمات اجازهٔ ذخیرهٔ مستقیم ندارد.
API 29+ از MediaStore.Downloads و نسخه‌های 24–28 از مجوز محدود WRITE_EXTERNAL_STORAGE
استفاده می‌کنند. اشتراک‌گذاری از ACTION_SEND و FileProvider با دسترسی خواندن به همان
فایل موقت استفاده می‌کند. فایل‌های اشتراکی برای مصرف مقصد باقی می‌مانند و کش قدیمی
پس از 24 ساعت هنگام اتصال بعدی پاک می‌شود. پل‌های پروژه، متن و انتخاب موتور تغییر قرارداد ندارند.

صرفاً جایگزین‌کردن assets در یک APK قدیمی برای این قابلیت کافی نیست؛ کلاینت جدید
باید ساخته/نصب شود. نبود پل جدید خطا می‌دهد، نه پیام موفقیت کاذب.

### ویندوز

`desktop/preload.cjs` فقط درخواست IPC محدود را عرضه می‌کند؛ sandbox و contextIsolation
فعال می‌مانند. main، webContents، frame و URL اصلی را بررسی می‌کند.
`packager-export.cjs` کش خصوصی و ذخیرهٔ بدون overwrite را مدیریت می‌کند.
`share-file.cjs` و `share-file.ps1` با API رسمی Windows DataTransferManager پنجرهٔ
اشتراک‌گذاری ویندوز را باز می‌کنند. helper بدون پنجرهٔ کنسول اجرا می‌شود، فرایندش
با بستن برنامه خاتمه می‌یابد و فایل‌های اشتراک‌گذاری بیش از 24 ساعت پاک‌سازی می‌شوند.
بازشدن پنجرهٔ اشتراک‌گذاری به معنی ارسال قطعی به برنامهٔ انتخابی نیست.

در مرورگر عادی Save از دانلود مرورگر و Share فقط از Web Share فایل پشتیبانی‌شده
استفاده می‌کند؛ مرورگرهای فاقد آن پیام خطا نشان می‌دهند.

## آفلاین و محدودیت واقعی

خود رابط، موتور HTML، موسیقی داخلی و addonهای پکیج محلی ساخته می‌شوند و برای پروژهٔ
عادی ساخت/اجرای HTML به اینترنت نیاز ندارد. پروژه‌ای که از URL خارجی، افزونهٔ سفارشی،
سرور ابری یا سرویس شبکه استفاده کند همچنان ممکن است به همان سرویس نیاز داشته باشد.
گزینهٔ embed extensions فقط تلاش برای استفاده از نسخهٔ قابل‌دسترسی است و تضمین
آفلاین‌شدن یک سرویس شبکه نیست. خروجی اجرایی HTML کد دلخواه پروژه را اجرا می‌کند؛
نباید به پل Native والد دسترسی پیدا کند.

## بیلد و بررسی

```powershell
npm ci
npm run build:android
```

این دستور به‌ترتیب GUI، Packager محلی، اعتبارسنجی آفلاین و دو نصب‌کنندهٔ ویندوز را
می‌سازد. خروجی کامل `build/` را به `app/src/main/assets/turbobuild/` منتقل کنید.
پوشهٔ `build/packager` را حذف نکنید. `npm run build:packager` تنها بخش داخلی را
بازسازی می‌کند و GUI قبلی را پاک نمی‌کند. خروجی ویندوز در `build-windows/installers/` است.
روند ادغام رسانه‌های مشترک اندروید همان `docs/EDITOR_ASSETS.md` کلاینت است و ویندوز
از دارایی‌های کامل خودش استفاده می‌کند.

```powershell
npm run test:unit
npm run build:verify-offline
# در ریشهٔ کلاینت اندروید:
.\gradlew.bat :app:testWebsiteDebugUnitTest --offline
.\gradlew.bat :app:assembleWebsiteDebug -PscratchEngines=both --offline
.\gradlew.bat :app:connectedWebsiteDebugAndroidTest -PscratchEngines=both '-Pandroid.testInstrumentationRunnerArguments.class=ir.behnamapps.fascratch.editor.PackagedExportDeviceTest' --offline
```

آزمون‌های خودکار انتقال در `test/packager-export.test.mjs` و آزمون واقعی گوشی در
`PackagedExportDeviceTest` کلاینت هستند. بررسی مرورگر سه زبان، حذف معرفی/انتخاب پروژه،
پروژهٔ جاری، محدودیت ارتفاع، تولید HTML، خطای ذخیره و تلاش مجدد و اجرای خروجی با
مسدودبودن درخواست‌های خارجی را پوشش می‌دهد. APIهای دانلود قدیمی Android 24–28
نیازمند آزمون روی دستگاه همان نسخه‌ها هستند.

نتیجهٔ بررسی این تغییر:

- 82 آزمون واحد GUI و 154 آزمون واحد کلاینت اندروید موفق بودند؛ lint فایل‌های
  رابط و انتقال جدید بدون خطا است.
- تولید/اجرای HTML در سه زبان، تم تیره، پاک‌شدن snapshot پس از بستن، خطای ذخیره
  و تلاش مجدد، موسیقی و addon کنترلر بازی با مسدودبودن شبکه آزمون شدند.
- گوشی Android 16 با WebView واقعی پروژهٔ جاری را ساخت و در Downloads ذخیره کرد.
  آزمون chooser بومی را بدون انتخاب مقصد اشتراک‌گذاری رهگیری کرد و درخواست ذخیره
  از iframe را رد کرد. آزمون مرورگرِ پل‌های قدیمی SB3، پیام جدید و عدد نیز موفق بود.
- در Electron واقعی x64 و ia32، ساخت HTML، ذخیرهٔ واقعی Downloads و بازشدن API
  پنجرهٔ اشتراک‌گذاری ویندوز موفق بود. آزمون‌ها با پروفایل موقت مستقل اجرا شدند
  تا داده‌ها و قفل پروفایل نشست‌های دیگر دخالت نکنند. هیچ فایلی برای شخصی ارسال نشد.
- همهٔ 1714 فایل وب در هر دو بستهٔ Windows با `build` یکسان‌اند. 1304 رسانهٔ اصلی
  سالم و 1500 فایل آموزشی حذف‌شده همچنان غایب‌اند؛ source map وجود ندارد.
- دستور کامل lint هنوز با خطای قبلی افزونهٔ `import/namespace` در کد addonها متوقف
  می‌شود. `i18n:src` هم با شناسهٔ تکراری قبلی `gui.menuBar.downloadToComputer` متوقف
  می‌شود؛ پیام‌های جدید استخراج و دیکشنری‌های فارسی/عربی مستقیماً بررسی شدند.

## پریست و اجرای مستقیم

نقطهٔ بازگشت پیش از این مرحله `d64b881` در GUI و `d741710` در کلاینت اندروید است.

رابط ساده دو پریست دارد و «کیفیت متوسط» برای تنظیمات تازه پیش‌فرض است. هر دو از
HTML مستقل، حفظ نسبت تصویر، شروع خودکار و نشانگر عادی استفاده می‌کنند. کنترل‌های
توقف، مکث و تمام‌صفحهٔ داخل HTML در هر دو پریست خاموش‌اند. در «بالاترین کیفیت» Interpolation و High Quality Pen هم روشن‌اند؛ در
«کیفیت متوسط» این دو خاموش‌اند. مشخصات پایهٔ موتور مثل compiler، packaged runtime،
محدودیت‌های عادی اسکرچ و نرخ 30 فریم در تنظیمات استاندارد ابزار باقی می‌مانند.
این نام‌ها preset تنظیمات هستند و تضمین مطلق کیفیت/سرعت برای هر پروژه نیستند.

تمام گزینه‌های حرفه‌ای و import/export تنظیمات زیر «تنظیمات پیشرفته» قرار دارند
و این بخش هنگام بازشدن بسته است؛ زیر عنوان آن توصیه می‌شود مقادیر تغییر نکنند.
ویرایش حرفه‌ای، حالت را «شخصی‌سازی‌شده» نشان می‌دهد. انتخاب مجدد یک پریست تنظیمات
آن را به پایهٔ پروژه برمی‌گرداند، از جمله تغییرات حرفه‌ای قبلی در همین ابزار؛
محتوای پروژهٔ ویرایشگر تغییر نمی‌کند.

لودینگ ساخت حلقهٔ متحرک، وضعیت و نوار نامعین دارد. زمان از شروع ساخت محاسبه می‌شود:
اگر ساخت زودتر تمام شد، باقیماندهٔ پنج ثانیه صبر می‌کند؛ ساخت کندتر تأخیر اضافه ندارد.
بستن دیالوگ، ساخت و timer را لغو می‌کند. خطای ساخت بدون تأخیر اجباری نمایش داده می‌شود.

«اجرای مستقیم» از همان Blob خروجی استفاده می‌کند. پخش‌کننده، قاب اجرا و دو دکمهٔ
آیکون‌دار «رفرش» و «بستن» دارد؛ رفرش نسخهٔ خروجی را از ابتدا اجرا می‌کند و بستن
به دیالوگ نتیجه با همان HTML برمی‌گردد. خروجی برای این کار دوباره ساخته نمی‌شود.

مرورگر و Electron از iframe با sandbox و بدون allow-same-origin استفاده می‌کنند؛
HTML به parent یا preload دسترسی ندارد و URL موقت هنگام بستن آزاد می‌شود.
قابلیت‌های نیازمند origin/storage مرورگر در چنین sandboxی محدودند؛ فایل ذخیره‌شده
را می‌توان در مرورگر مستقل اجرا کرد. در اندروید از iframe داخل WebView ویرایشگر
استفاده نمی‌شود، چون addJavascriptInterface در تمام فریم‌های آن در دسترس است.
پل امن، HTML را در کش خصوصی کامل می‌کند و `PackagedHtmlPlayer` را در همان ScratchScreen با WebView
جدا، بدون هیچ پل پروژه/ورودی/خروجی باز می‌کند. ذخیره‌سازی عادی HTML در آن فعال است.
این پخش‌کننده فایل محلی تکمیل‌شده را با asset loader محدود می‌خواند، از تمام‌صفحه
پشتیبانی می‌کند و هنگام بستن WebView و فایل موقت خودش را آزاد می‌کند.

پریست، حداقل زمان، لغو timer و انتقال native preview در آزمون‌های واحد پوشش دارند.
مرورگر fa/ar/en و Electron x64/ia32، اجرای مستقیم، autoplay، رفرش، بستن، ایزوله‌بودن
و ذخیره/اشتراک‌گذاری را گذرانده‌اند. آزمون واقعی Android 16 نیز بازشدن WebView مستقل،
نبود هر سه پل در آن، رفرش، بستن و حفظ ذخیره/اشتراک‌گذاری پس از بازگشت را تأیید کرد.

## بارگذاری سرد پروژه از خانهٔ اندروید

خطای «Could not load project» هنگام انتخاب TurboWarp در «پروژه‌های من» ناشی از
هم‌زمانی فرمان میزبان با LOADING_VM_NEW_DEFAULT بود: requestProjectUpload در آن
حالت action برنمی‌گرداند و dispatch با TypeError شکست می‌خورد. بازکردن همان فایل
از داخل ویرایشگر موفق بود چون تا آن زمان حالت SHOWING آماده شده بود.

SBFileUploader اکنون فرمان URL زودرس را بدون fetch/dispatch نگه می‌دارد، روی تغییر
به حالت SHOWING آن را یک‌بار مصرف می‌کند و هنگام unmount پاک می‌کند. تابع میزبان
از ابتدا قابل فراخوانی می‌ماند تا timeout ده‌ثانیه‌ای polling اندروید موجب ازدست‌رفتن
فرمان نشود. هیچ تأخیر حدسی و هیچ تغییری در فرمت SB3 یا دادهٔ پروژه اضافه نشده است.
آزمون lifecycle و بازتولید مرورگر با شروع صفر/۱۰/۴۰/۱۰۰ میلی‌ثانیه این مسیر را پوشش
می‌دهند. آزمون QueuedProjectDeviceTest کلاینت نیز همان queueProjectFromHome و مسیر
واقعی پروژه‌های خصوصی را پیش از راه‌اندازی WebView به کار می‌گیرد.

بررسی نهایی این مرحله: 86 آزمون واحد GUI، 154 آزمون واحد اندروید و دو آزمون واقعی
گوشی (بارگذاری سرد پروژه و ابزار HTML/پخش‌کننده) موفق بودند. هر 1714 فایل وب در
assets خام و داخل APK نهایی با build یکسان‌اند؛ هر دو موتور Scratch/Turbo حفظ شده‌اند.
دو نصب‌کنندهٔ ویندوز نیز از همین فایل‌ها ساخته شده‌اند. دستور i18n:src همچنان با
شناسهٔ تکراری قدیمی gui.menuBar.downloadToComputer متوقف می‌شود؛ lint فایل‌های
تغییرکرده موفق است و پیام‌های جدید فارسی/عربی/انگلیسی بررسی شده‌اند.

## نوار کناری در پخش HTML

نقطهٔ بازگشت پیش از این مرحله: GUI `cc95399` و کلاینت `fd6c9c3`.
دکمه‌های توقف، مکث و تمام‌صفحهٔ خروجی در تمام پریست‌ها غیرفعال‌اند. انتخاب پریست
مستقیماً همان store متصل به checkboxهای پیشرفته را تغییر می‌دهد؛ state موازی ندارد.

نوار افقی عنوان/دکمه‌های پخش حذف شده است. در اندروید، اجرای HTML داخل صفحهٔ موجود
و با WebView مستقل روی origin خصوصی player.farsiscratch.invalid انجام می‌شود.
ویرایشگر اصلی پنهان می‌ماند و دوباره ساخته یا بارگذاری نمی‌شود. نوار سمت چپ،
صفحه‌کلید شناور و میانبرهای قبلی حفظ می‌شوند؛ خانه و اسلایدر پیمایش موقتاً حذف و
دو آیکون بستن/رفرش اضافه می‌شوند. کلیدها به View پخش‌کننده هدایت می‌شوند و پیش از
رفرش یا بستن رها می‌شوند. بستن HTML همان editor/result را با خانه و اسلایدر برمی‌گرداند.
FullScreen سفارشی فقط محتوای قاب بازی را تعویض می‌کند تا نوار چپ قابل نمایش بماند.
مرورگر/ویندوز نیز به‌جای نوار افقی دو آیکون را در ستون سمت چپ نشان می‌دهند.


## Android private HTML library

Android HTML Save persists the completed file in the host's private My Projects
library. The bridge responds with `location: "library"` and the localized result
says Saved in My Projects. Windows/browser downloads and settings JSON saves keep
their existing destinations. The native library defaults to SB3 and has a separate
HTML tab with Play and Share. Library playback copies the saved file into a fresh
private playback cache; closing destroys the player and deletes only that copy.
Direct Share from the packager remains a temporary export and does not implicitly
save a library entry. Existing Downloads files are not scanned or moved.

## Automatic quality playback

The toolbar button uses `packager/index.html?autobuild=high`, the same current VM
snapshot and high preset. It has no artificial five-second wait. The builder
unmounts when HTML is ready, and closing destroys the sandbox player/revokes its
URL or asks Android to dispose the bridge-free native player. AbortSignal cancels
an in-flight export; manual packaging retains its five-second indicator.
The original Scratch GUI now exposes the equivalent manual packager using its
own pinned local runtime and the same Android host protocol.

## Isolated SVG-compatible desktop player

The manual and quality-run players load a `data:` bootstrap inside a sandboxed
iframe with `allow-same-origin`. The data document has its own opaque origin; it
receives the HTML Blob only from its parent and creates the player Blob URL there.
The running project cannot access the editor origin or desktop/native bridges,
but its SVG renderer can access its own no-script sandbox iframe. Removing the
player frame ends the isolated player; refresh creates a fresh bootstrap frame.
Do not create the player Blob URL in the editor origin and then add
`allow-same-origin`: that combination would expose the editor to the project.
Native Android playback continues to use its separate bridge-free WebView.
