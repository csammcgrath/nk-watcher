const NK_URL = 'https://www.novelkeys.xyz';

const nk = {
    'home': NK_URL,
    'cart': `${NK_URL}/cart`,
    'nk65_entry': `${NK_URL}/products/nk65-entry-edition`
};

const nk_selectors = {
    'add_to_cart_button': '#AddToCart-product-template',
    'add_to_cart_success': '.product-form__item.product-form__item--submit.product-form__item--no-variants > p',
    'cart_list': '#shopify-section-cart-template > div > form > table tr td',
    'cart_list_check_out_button': 'input.btn.btn--small-wide.cart__submit.cart__submit-control',
    'shipping_address_load': 'div.dynamic-checkout__buttons'
}

const nk_shipping_selectors = {
    'email': '#checkout_email',
    'first_name': '#checkout_shipping_address_first_name',
    'last_name': '#checkout_shipping_address_last_name',
    'address': '#checkout_shipping_address_address1',
    'address2': '#checkout_shipping_address_address2',
    'city': '#checkout_shipping_address_city',
    'state': '#checkout_shipping_address_province',
    'zip': '#checkout_shipping_address_zip',
    'phone': '#checkout_shipping_address_phone',
    'subscribe_checkbox': '#checkout_buyer_accepts_marketing',
    'save_shipping_info_checkbox': '#checkout_remember_me'
}

module.exports = {
    nk,
    nk_selectors,
    nk_shipping_selectors
};