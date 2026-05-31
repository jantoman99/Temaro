(function () {
  var script = document.currentScript;

  if (!script) {
    return;
  }

  var slug = (script.getAttribute("data-slug") || "").trim();
  var safeSlug = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

  if (!safeSlug.test(slug)) {
    return;
  }

  var height = Number(script.getAttribute("data-height") || "760");
  var title = (script.getAttribute("data-title") || "Online rezervace").trim();
  var origin = "";

  try {
    origin = new URL(script.src).origin;
  } catch {
    return;
  }

  if (!Number.isFinite(height) || height < 480 || height > 1200) {
    height = 760;
  }

  if (!title || title.length > 80) {
    title = "Online rezervace";
  }

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/embed/booking/" + encodeURIComponent(slug) + "?source=widget";
  iframe.title = title;
  iframe.loading = "lazy";
  iframe.sandbox = "allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";
  iframe.allow = "camera 'none'; microphone 'none'; geolocation 'none'";
  iframe.setAttribute("data-temaro-booking-widget", slug);
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.minHeight = String(height) + "px";
  iframe.style.border = "0";
  iframe.style.borderRadius = "18px";
  iframe.style.boxShadow = "0 18px 44px rgba(15, 23, 42, 0.16)";
  iframe.style.background = "#ffffff";

  script.insertAdjacentElement("afterend", iframe);
})();
