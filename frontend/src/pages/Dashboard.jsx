import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const modules = [
  {
    title: 'Supplier Records',
    description: 'Keep supplier details in one place so the purchase team can raise orders, compare quotations, and follow up without searching through files.',
  },
  {
    title: 'Dealer Records',
    description: 'Maintain dealer information, delivery contacts, and order-facing details so dispatch and billing stay coordinated.',
  },
  {
    title: 'Planning and Control',
    description: 'Use stock position, quotation status, and demand visibility to decide what needs to be purchased, produced, and delivered next.',
  },
];

const workflow = [
  'Sales history and current orders help the company estimate upcoming stock needs.',
  'The manager reviews shortages in raw materials and raises supplier requests where needed.',
  'Suppliers send quotations against the requested materials.',
  'After review, approved quotations move forward for purchase and production planning.',
  'Finished products are added to stock and prepared against dealer demand.',
  'Billing and dispatch records are completed once the order is ready to move out.',
];


const operations = [
  'Register a new supplier',
  'Register a new dealer',
  'Check raw material balance',
  'Review pending quotations',
  'Prepare the next production batch',
  'Create dealer billing records',
];

const emptySupplierForm = {
  supplierId: '',
  name: '',
  companyId: '',
  city: '',
  contactDetails: '',
};

const emptyMaterialForm = {
  materialId: '',
  name: '',
  stock: '',
  reorderLevel: '',
};

const emptyDealerForm = {
  dealerId: '',
  name: '',
  companyId: '',
  city: '',
  contactDetails: '',
};

const emptySupplierOrderForm = {
  supplierId: '',
  rawMaterialsDescription: '',
  quantity: '',
};

const emptyDealerBillForm = {
  dealerId: '',
  description: '',
  amount: '',
};

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone =
    status === 'Approved' || status === 'Healthy' || status === 'Active' || status === 'Onboarded'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'Pending'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-rose-100 text-rose-700';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status}</span>;
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        required
      />
    </label>
  );
}

function Feedback({ message, tone }) {
  if (!message) {
    return null;
  }

  const classes =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${classes}`}>{message}</div>;
}

export default function Dashboard() {
  const [suppliers, setSuppliers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [dealerBills, setDealerBills] = useState([]);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [dealerForm, setDealerForm] = useState(emptyDealerForm);
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm);
  const [supplierOrderForm, setSupplierOrderForm] = useState(emptySupplierOrderForm);
  const [dealerBillForm, setDealerBillForm] = useState(emptyDealerBillForm);
  const [inventorySearch, setInventorySearch] = useState('');
  const [supplierMessage, setSupplierMessage] = useState('');
  const [dealerMessage, setDealerMessage] = useState('');
  const [materialMessage, setMaterialMessage] = useState('');
  const [supplierTone, setSupplierTone] = useState('success');
  const [dealerTone, setDealerTone] = useState('success');
  const [materialTone, setMaterialTone] = useState('success');
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingQuotations, setLoadingQuotations] = useState(true);
  const [loadingBills, setLoadingBills] = useState(true);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [savingSupplierOrder, setSavingSupplierOrder] = useState(false);
  const [savingDealerBill, setSavingDealerBill] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadDealers();
    loadMaterials();
    loadQuotations();
    loadDealerBills();
  }, []);

  async function loadSuppliers() {
    try {
      setLoadingSuppliers(true);
      const response = await axios.get(`${API_BASE_URL}/suppliers`);
      setSuppliers(response.data);
    } catch {
      setSupplierTone('error');
      setSupplierMessage('We could not load supplier records right now.');
    } finally {
      setLoadingSuppliers(false);
    }
  }

  async function loadDealers() {
    try {
      setLoadingDealers(true);
      const response = await axios.get(`${API_BASE_URL}/dealers`);
      setDealers(response.data);
    } catch {
      setDealerTone('error');
      setDealerMessage('We could not load dealer records right now.');
    } finally {
      setLoadingDealers(false);
    }
  }

  async function loadMaterials() {
    try {
      setLoadingMaterials(true);
      const response = await axios.get(`${API_BASE_URL}/rawMaterials`);
      setMaterials(response.data);
    } catch {
      setMaterialTone('error');
      setMaterialMessage('We could not load raw material records right now.');
    } finally {
      setLoadingMaterials(false);
    }
  }

  function handleSupplierChange(event) {
    const { name, value } = event.target;
    setSupplierForm((current) => ({ ...current, [name]: value }));
  }

  function handleDealerChange(event) {
    const { name, value } = event.target;
    setDealerForm((current) => ({ ...current, [name]: value }));
  }

  function handleMaterialChange(event) {
    const { name, value } = event.target;
    setMaterialForm((current) => ({ ...current, [name]: value }));
  }

  function handleSupplierOrderChange(event) {
    const { name, value } = event.target;
    setSupplierOrderForm((current) => ({ ...current, [name]: value }));
  }

  function handleDealerBillChange(event) {
    const { name, value } = event.target;
    setDealerBillForm((current) => ({ ...current, [name]: value }));
  }

  async function loadQuotations() {
    try {
      setLoadingQuotations(true);
      const response = await axios.get(`${API_BASE_URL}/orders/quotations`);
      setQuotations(response.data);
    } catch {
      console.error('We could not load quotations right now.');
    } finally {
      setLoadingQuotations(false);
    }
  }

  async function loadDealerBills() {
    try {
      setLoadingBills(true);
      const response = await axios.get(`${API_BASE_URL}/orders/dealer`);
      setDealerBills(response.data);
    } catch {
      console.error('We could not load bills right now.');
    } finally {
      setLoadingBills(false);
    }
  }

  async function handleSupplierSubmit(event) {
    event.preventDefault();
    setSavingSupplier(true);
    setSupplierMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/suppliers`, supplierForm);
      setSuppliers((current) => [response.data.supplier, ...current]);
      setSupplierForm(emptySupplierForm);
      setSupplierTone('success');
      setSupplierMessage('Supplier has been added successfully.');
    } catch (error) {
      setSupplierTone('error');
      setSupplierMessage(error.response?.data?.error || 'Supplier could not be added.');
    } finally {
      setSavingSupplier(false);
    }
  }

  async function handleDealerSubmit(event) {
    event.preventDefault();
    setSavingDealer(true);
    setDealerMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/dealers`, dealerForm);
      setDealers((current) => [response.data.dealer, ...current]);
      setDealerForm(emptyDealerForm);
      setDealerTone('success');
      setDealerMessage('Dealer has been added successfully.');
    } catch (error) {
      setDealerTone('error');
      setDealerMessage(error.response?.data?.error || 'Dealer could not be added.');
    } finally {
      setSavingDealer(false);
    }
  }

  async function handleMaterialSubmit(event) {
    event.preventDefault();
    setSavingMaterial(true);
    setMaterialMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/rawMaterials`, materialForm);
      setMaterials((current) => [response.data.material, ...current]);
      setMaterialForm(emptyMaterialForm);
      setMaterialTone('success');
      setMaterialMessage('Raw material has been added successfully.');
    } catch (error) {
      setMaterialTone('error');
      setMaterialMessage(error.response?.data?.error || 'Material could not be added.');
    } finally {
      setSavingMaterial(false);
    }
  }

  async function handleSupplierOrderSubmit(event) {
    event.preventDefault();
    setSavingSupplierOrder(true);
    try {
      await axios.post(`${API_BASE_URL}/orders/supplier`, supplierOrderForm);
      setSupplierOrderForm(emptySupplierOrderForm);
      loadQuotations();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSupplierOrder(false);
    }
  }

  async function handleDealerBillSubmit(event) {
    event.preventDefault();
    setSavingDealerBill(true);
    try {
      await axios.post(`${API_BASE_URL}/orders/dealer`, dealerBillForm);
      setDealerBillForm(emptyDealerBillForm);
      loadDealerBills();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingDealerBill(false);
    }
  }

  async function updateQuotationStatus(id, status) {
    try {
      await axios.put(`${API_BASE_URL}/orders/quotations/${id}`, { status });
      loadQuotations();
    } catch (err) {
      console.error('Unable to update quotation status');
    }
  }

  const filteredMaterials = materials.filter(m => 
    m.item.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    m.materialId.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffef8_0%,#f7f8fc_38%,#edf4f7_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-amber-300">
              W
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">WAMS</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Manufacturing Operations Portal</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#overview" className="transition hover:text-slate-900">Overview</a>
            <a href="#supplier-management" className="transition hover:text-slate-900">Suppliers</a>
            <a href="#dealer-management" className="transition hover:text-slate-900">Dealers</a>
            <a href="#inventory-management" className="transition hover:text-slate-900">Inventory</a>
            <a href="#operations" className="transition hover:text-slate-900">Operations</a>
          </nav>

          <a
            href="#supplier-management"
            className="rounded-full bg-green-300 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Open Workspace
          </a>
        </div>
      </header>

      <main>
        <section id="overview" className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),transparent_35%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div className="relative">
              <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                Software Engineering assignment 5
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                WAMS software for managing dealers and supliers
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                This portal is designed for a manufacturing company that works against orders. It brings together supplier registration,
                dealer registration, stock visibility, quotation review, manufacturing planning, and billing support in one clear workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Supplier onboarding
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Dealer onboarding
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Stock and quotation tracking
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Suppliers" value={suppliers.length} detail="Supplier records currently available for purchasing and quotation work." />
                <MetricCard label="Dealers" value={dealers.length} detail="Dealer accounts maintained for dispatch planning and billing." />
                <MetricCard label="Core Areas" value="06" detail="Key functions covering procurement, stock, production, and delivery." />
              </div>
            </div>

            {/* <div className="relative">
              <div className="rounded-[32px] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_35px_90px_-40px_rgba(15,23,42,0.9)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Today&apos;s Focus</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">What needs attention</h2>

                <div className="mt-6 space-y-4">
                  {[
                    'One material line is already below its reorder level and should be reviewed by purchasing.',
                    'An approved quotation is waiting for the next manufacturing decision.',
                    'New supplier and dealer records can be added directly from the panels below.',
                  ].map((note) => (
                    <div key={note} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                      {note}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Decision Support</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    The purpose of this system is simple: give management one place to review stock, supplier responses,
                    dealer demand, and pending tasks before making the next operational decision.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.title}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]"
              >
                <h3 className="text-xl font-black tracking-tight text-slate-900">{module.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{module.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="supplier-management" className="border-y border-slate-200/70 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Supplier Management"
            title="Add and review supplier records."
            description="This section supports the supplier onboarding use case. New supplier entries are saved to the database, and duplicate supplier or company IDs are blocked."
          />

            <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_70px_-40px_rgba(15,23,42,0.85)]">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">New Supplier</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">Create a supplier profile</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Enter the supplier&apos;s basic business details below. Once saved, the record becomes available for future orders and quotations.
                </p>

                <form onSubmit={handleSupplierSubmit} className="mt-6 space-y-4">
                  <InputField label="Supplier ID" name="supplierId" value={supplierForm.supplierId} onChange={handleSupplierChange} placeholder="SUP-401" />
                  <InputField label="Supplier Name" name="name" value={supplierForm.name} onChange={handleSupplierChange} placeholder="Apex Industrial Supply" />
                  <InputField label="Company ID" name="companyId" value={supplierForm.companyId} onChange={handleSupplierChange} placeholder="COMP-1402" />
                  <InputField label="City" name="city" value={supplierForm.city} onChange={handleSupplierChange} placeholder="Pune" />
                  <InputField label="Contact Details" name="contactDetails" value={supplierForm.contactDetails} onChange={handleSupplierChange} placeholder="+91 98765 43210 / supply@apex.com" />
                  <Feedback message={supplierMessage} tone={supplierTone} />
                  <button
                    type="submit"
                    disabled={savingSupplier}
                    className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingSupplier ? 'Saving Supplier...' : 'Save Supplier'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Supplier Directory</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Current supplier list</h3>
                  </div>
                  <button
                    type="button"
                    onClick={loadSuppliers}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Reload
                  </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 font-bold">Supplier ID</th>
                        <th className="px-3 py-3 font-bold">Name</th>
                        <th className="px-3 py-3 font-bold">Company ID</th>
                        <th className="px-3 py-3 font-bold">City</th>
                        <th className="px-3 py-3 font-bold">Contact</th>
                        <th className="px-3 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSuppliers ? (
                        <tr>
                          <td className="px-3 py-6 text-slate-500" colSpan="6">Loading supplier records...</td>
                        </tr>
                      ) : suppliers.length === 0 ? (
                        <tr>
                          <td className="px-3 py-6 text-slate-500" colSpan="6">No supplier records have been added yet.</td>
                        </tr>
                      ) : (
                        suppliers.map((supplier) => (
                          <tr key={supplier.id} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-4 font-semibold text-slate-900">{supplier.supplierId}</td>
                            <td className="px-3 py-4 text-slate-700">{supplier.name}</td>
                            <td className="px-3 py-4 text-slate-700">{supplier.companyId}</td>
                            <td className="px-3 py-4 text-slate-700">{supplier.city}</td>
                            <td className="px-3 py-4 text-slate-700">{supplier.contactDetails}</td>
                            <td className="px-3 py-4"><StatusBadge status={supplier.status} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="mt-6 rounded-[32px] border border-slate-200 bg-amber-50 p-6 shadow-sm">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Procurement: Place Supplier Order</h3>
              <p className="mt-2 text-sm text-slate-600">Send an inventory request to an active supplier.</p>
              
              <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:items-start">
                <form onSubmit={handleSupplierOrderSubmit} className="grid gap-4 sm:grid-cols-2 items-end">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Supplier</span>
                    <select
                      name="supplierId"
                      value={supplierOrderForm.supplierId}
                      onChange={handleSupplierOrderChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      required
                    >
                      <option value="" disabled>Select supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.supplierId}>{s.name} ({s.supplierId})</option>)}
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <InputField label="Raw Materials Request" name="rawMaterialsDescription" value={supplierOrderForm.rawMaterialsDescription} onChange={handleSupplierOrderChange} placeholder="e.g. 5mm Copper Wire" />
                  </div>
                  <InputField label="Quantity" name="quantity" value={supplierOrderForm.quantity} onChange={handleSupplierOrderChange} placeholder="500" />
                  <button
                    type="submit"
                    disabled={savingSupplierOrder}
                    className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:opacity-70 h-[46px]"
                  >
                    {savingSupplierOrder ? 'Requesting...' : 'Place Order'}
                  </button>
                </form>

                <div className="rounded-2xl bg-white p-5 border border-slate-200">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Recent Raw Materials</p>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                    {loadingMaterials ? <p className="text-sm text-slate-500">Loading materials...</p> : materials.length === 0 ? <p className="text-sm text-slate-500">No raw materials exist.</p> : materials.slice(0, 5).map(material => (
                      <div key={material.materialId} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{material.item}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{material.materialId}</p>
                        </div>
                        <p className="font-black text-slate-900 text-right">
                          <span className="block text-[10px] font-bold uppercase text-slate-400">Stock</span>
                          {material.stock}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dealer-management" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Dealer Management"
            title="Add and review dealer records."
            description="This section supports dealer onboarding so sales, dispatch, and billing teams can work from one up-to-date dealer list."
          />

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Dealer Directory</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Current dealer list</h3>
                  </div>
                <button
                  type="button"
                  onClick={loadDealers}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Reload
                  </button>
                </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-3 font-bold">Dealer ID</th>
                      <th className="px-3 py-3 font-bold">Name</th>
                      <th className="px-3 py-3 font-bold">Company ID</th>
                      <th className="px-3 py-3 font-bold">City</th>
                      <th className="px-3 py-3 font-bold">Contact</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDealers ? (
                      <tr>
                        <td className="px-3 py-6 text-slate-500" colSpan="6">Loading dealer records...</td>
                      </tr>
                    ) : dealers.length === 0 ? (
                      <tr>
                        <td className="px-3 py-6 text-slate-500" colSpan="6">No dealer records have been added yet.</td>
                      </tr>
                    ) : (
                      dealers.map((dealer) => (
                        <tr key={dealer.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-4 font-semibold text-slate-900">{dealer.dealerId}</td>
                          <td className="px-3 py-4 text-slate-700">{dealer.name}</td>
                          <td className="px-3 py-4 text-slate-700">{dealer.companyId}</td>
                          <td className="px-3 py-4 text-slate-700">{dealer.city}</td>
                          <td className="px-3 py-4 text-slate-700">{dealer.contactDetails}</td>
                          <td className="px-3 py-4"><StatusBadge status={dealer.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-slate-900 p-6 text-white shadow-[0_25px_70px_-40px_rgba(15,23,42,0.85)]">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">New Dealer</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Create a dealer profile</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Add the dealer&apos;s business and contact details so orders, dispatch updates, and billing can be handled from the same system.
              </p>

              <form onSubmit={handleDealerSubmit} className="mt-6 space-y-4">
                <InputField label="Dealer ID" name="dealerId" value={dealerForm.dealerId} onChange={handleDealerChange} placeholder="DLR-210" />
                <InputField label="Dealer Name" name="name" value={dealerForm.name} onChange={handleDealerChange} placeholder="Metro Distributors" />
                <InputField label="Company ID" name="companyId" value={dealerForm.companyId} onChange={handleDealerChange} placeholder="D-COMP-883" />
                <InputField label="City" name="city" value={dealerForm.city} onChange={handleDealerChange} placeholder="Nagpur" />
                <InputField label="Contact Details" name="contactDetails" value={dealerForm.contactDetails} onChange={handleDealerChange} placeholder="+91 99887 77665 / orders@metro.in" />
                <Feedback message={dealerMessage} tone={dealerTone} />
                <button
                  type="submit"
                  disabled={savingDealer}
                  className="w-full rounded-2xl bg-sky-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingDealer ? 'Saving Dealer...' : 'Save Dealer'}
                </button>
              </form>
            </section>
            </div>

            <div className="mt-6 rounded-[32px] border border-slate-200 bg-sky-50 p-6 shadow-sm">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Dealer Billing</h3>
              <p className="mt-2 text-sm text-slate-600">Generate a completed bill record for an existing dealer order.</p>

              <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:items-start">
                <form onSubmit={handleDealerBillSubmit} className="grid gap-4 sm:grid-cols-2 items-end">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-700">Dealer</span>
                    <select
                      name="dealerId"
                      value={dealerBillForm.dealerId}
                      onChange={handleDealerBillChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                      required
                    >
                      <option value="" disabled>Select dealer</option>
                      {dealers.map(d => <option key={d.id} value={d.dealerId}>{d.name} ({d.dealerId})</option>)}
                    </select>
                  </label>
                  <div className="sm:col-span-2">
                    <InputField label="Description" name="description" value={dealerBillForm.description} onChange={handleDealerBillChange} placeholder="Order #90210 Dispatch" />
                  </div>
                  <InputField label="Amount (Rs)" name="amount" value={dealerBillForm.amount} onChange={handleDealerBillChange} placeholder="25000" />
                  <button
                    type="submit"
                    disabled={savingDealerBill}
                    className="rounded-2xl bg-sky-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-200 disabled:opacity-70 h-[46px]"
                  >
                    {savingDealerBill ? 'Generating...' : 'Generate Bill'}
                  </button>
                </form>

                <div className="rounded-2xl bg-white p-5 border border-slate-200">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Recent Bills</p>
                  <div className="space-y-3 max-h-[160px] overflow-y-auto">
                    {loadingBills ? <p className="text-sm text-slate-500">Loading bills...</p> : dealerBills.length === 0 ? <p className="text-sm text-slate-500">No bills generated yet.</p> : dealerBills.map(bill => (
                      <div key={bill.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{bill.dealerName}</p>
                          <p className="text-slate-500">{bill.description}</p>
                        </div>
                        <p className="font-black text-slate-900">Rs {bill.amount.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </section>

        <section id="inventory-management" className="border-y border-slate-200/70 bg-[linear-gradient(180deg,#fffef8_0%,#f7f8fc_38%,#edf4f7_100%)]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Inventory Management"
              title="Add and update raw material stock."
              description="Keep track of raw materials in the system so the manufacturing team knows what is available, and purchasing knows when to reorder."
            />

            <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_70px_-40px_rgba(15,23,42,0.85)]">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">New Material</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">Add raw material to stock</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Register a new type of raw material or part to track its stock value and health natively inside WAMS.
                </p>

                <form onSubmit={handleMaterialSubmit} className="mt-6 space-y-4">
                  <InputField label="Material ID" name="materialId" value={materialForm.materialId} onChange={handleMaterialChange} placeholder="RM-702" />
                  <InputField label="Name/Description" name="name" value={materialForm.name} onChange={handleMaterialChange} placeholder="Copper Coil" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Initial Stock" name="stock" value={materialForm.stock} onChange={handleMaterialChange} placeholder="100" />
                    <InputField label="Reorder Level" name="reorderLevel" value={materialForm.reorderLevel} onChange={handleMaterialChange} placeholder="25" />
                  </div>
                  <Feedback message={materialMessage} tone={materialTone} />
                  <button
                    type="submit"
                    disabled={savingMaterial}
                    className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingMaterial ? 'Saving Material...' : 'Save Material'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Stock Table</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Current material registry</h3>
                  </div>
                  <button
                    type="button"
                    onClick={loadMaterials}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    Reload
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <input
                    type="text"
                    placeholder="Search inventory by name or ID..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr className="border-b border-slate-200">
                        <th className="px-3 py-3 font-bold">Material ID</th>
                        <th className="px-3 py-3 font-bold">Name</th>
                        <th className="px-3 py-3 font-bold pl-10">Stock</th>
                        <th className="px-3 py-3 font-bold pl-8">Reorder Level</th>
                        <th className="px-3 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingMaterials ? (
                        <tr>
                          <td className="px-3 py-6 text-slate-500" colSpan="5">Loading materials...</td>
                        </tr>
                      ) : filteredMaterials.length === 0 ? (
                        <tr>
                          <td className="px-3 py-6 text-slate-500" colSpan="5">No matching materials found.</td>
                        </tr>
                      ) : (
                        filteredMaterials.map((material) => (
                          <tr key={material.id} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-4 font-semibold text-slate-900">{material.materialId}</td>
                            <td className="px-3 py-4 text-slate-700">{material.item}</td>
                            <td className="px-3 py-4 text-slate-700 pl-10 font-bold">{material.stock}</td>
                            <td className="px-3 py-4 text-slate-700 pl-8">{material.reorder}</td>
                            <td className="px-3 py-4"><StatusBadge status={material.state} /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section id="operations" className="border-y border-slate-200/70 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Operations Monitoring"
            title="Supporting information stays visible in the same workspace."
            description="Supplier and dealer onboarding are live. Around those forms, the page also shows the kind of stock, quotation, and workflow information a manager would expect to review during the day."
          />

            <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_70px_-40px_rgba(15,23,42,0.85)]">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Quick Checklist</p>
                <div className="mt-5 space-y-3">
                  {operations.map((operation) => (
                    <div key={operation} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-200">
                      {operation}
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)]">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Raw Materials</p>
                  <div className="mt-5 space-y-4">
                    {loadingMaterials ? (
                      <p className="text-sm text-slate-500">Loading...</p>
                    ) : materials.length === 0 ? (
                      <p className="text-sm text-slate-500">No raw materials track.</p>
                    ) : (
                      materials.slice(0, 3).map((material) => (
                        <div key={material.materialId} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-base font-black text-slate-900">{material.item}</h4>
                              <p className="mt-1 text-sm text-slate-500">Available stock: {material.stock} units</p>
                            </div>
                            <StatusBadge status={material.state} />
                          </div>
                          <p className="mt-3 text-sm text-slate-600">Reorder level: {material.reorder} units</p>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.45)] flex flex-col max-h-[400px]">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Quotation Review</p>
                  <div className="mt-5 space-y-4 overflow-y-auto flex-1 pr-2">
                    {loadingQuotations ? (
                      <p className="text-sm text-slate-500">Loading Quotations...</p>
                    ) : quotations.length === 0 ? (
                      <p className="text-sm text-slate-500">No pending quotations.</p>
                    ) : (
                      quotations.map((quotation) => (
                        <div key={quotation.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-base font-black text-slate-900">{quotation.supplier}</h4>
                              <p className="mt-1 text-sm text-slate-500">{quotation.date}</p>
                            </div>
                            <StatusBadge status={quotation.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-lg font-black text-slate-900">{quotation.amount}</p>
                            {quotation.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button type="button" onClick={() => updateQuotationStatus(quotation.id, 'Approved')} className="rounded bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200 transition">Approve</button>
                                <button type="button" onClick={() => updateQuotationStatus(quotation.id, 'Rejected')} className="rounded bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-200 transition">Reject</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </section>
            </div>

            {/* <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div> */}
          </div>
        </section>
      </main>
    </div>
  );
}
