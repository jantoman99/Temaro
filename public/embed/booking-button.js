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

  var label = (script.getAttribute("data-label") || "Rezervovat termín").trim();
  var color = (script.getAttribute("data-color") || "#635BFF").trim();
  var target = script.getAttribute("data-target") === "_self" ? "_self" : "_blank";
  var url = script.getAttribute("data-url");
  var origin = "";

  try {
    origin = new URL(script.src).origin;
  } catch {
    return;
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    color = "#635BFF";
  }

  if (!label || label.length > 80) {
    label = "Rezervovat termín";
  }

  try {
    url = url ? new URL(url).toString() : origin + "/" + encodeURIComponent(slug);
  } catch {
    url = origin + "/" + encodeURIComponent(slug);
  }

  var link = document.createElement("a");
  link.href = url;
  link.target = target;
  link.rel = target === "_blank" ? "noopener noreferrer" : "";
  link.textContent = label;
  link.setAttribute("data-temaro-booking-button", slug);
  link.style.display = "inline-flex";
  link.style.alignItems = "center";
  link.style.justifyContent = "center";
  link.style.minHeight = "44px";
  link.style.padding = "0 18px";
  link.style.borderRadius = "12px";
  link.style.background = color;
  link.style.color = "#ffffff";
  link.style.font = "700 14px/1.1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  link.style.textDecoration = "none";
  link.style.boxShadow = "0 10px 24px rgba(15, 23, 42, 0.14)";

  script.insertAdjacentElement("afterend", link);
})();
