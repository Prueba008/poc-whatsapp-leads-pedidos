export const whatsappPayload = {
  object: 'whatsapp_business_account', entry: [{ changes: [{ value: {
    contacts: [{ profile: { name: 'Sergio R.' }, wa_id: '5491112345678' }],
    messages: [{ from: '5491112345678', id: 'wamid.TEST-001', timestamp: '1785801600', type: 'text', text: { body: 'Quiero consultar precios' } }]
  }, field: 'messages' }] }]
};
