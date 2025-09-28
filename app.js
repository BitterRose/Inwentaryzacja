Oto kompletny plik `app.js` z emoji zamiast ikon Lucide:

```javascript
const { useState, useEffect, useRef } = React;

const InventoryApp = () => {
  // Przykładowe dane produktów z 8-cyfrowymi kodami SAP
  const [products] = useState([
    { id: 1, sapCode: '10001234', name: 'Laptop Dell Latitude 5520', category: 'Elektronika', expectedQty: 15, countedQty: null },
    { id: 2, sapCode: '20005678', name: 'Krzesło biurowe ergonomiczne', category: 'Meble', expectedQty: 45, countedQty: null },
    { id: 3, sapCode: '10009876', name: 'Monitor Samsung 24"', category: 'Elektronika', expectedQty: 30, countedQty: null },
    { id: 4, sapCode: '30001111', name: 'Długopis niebieski Pilot', category: 'Biuro', expectedQty: 200, countedQty: null },
    { id: 5, sapCode: '30002222', name: 'Papier A4 80g/m² - ryza', category: 'Biuro', expectedQty: 50, countedQty: null },
    { id: 6, sapCode: '10003333', name: 'Klawiatura bezprzewodowa Logitech', category: 'Elektronika', expectedQty: 25, countedQty: null },
    { id: 7, sapCode: '20004444', name: 'Stół konferencyjny 200x100cm', category: 'Meble', expectedQty: 3, countedQty: null },
    { id: 8, sapCode: '40005555', name: 'Toner HP LaserJet CF217A', category: 'Materiały eksploatacyjne', expectedQty: 12, countedQty: null },
    { id: 9, sapCode: '10006666', name: 'Mysz optyczna Logitech', category: 'Elektronika', expectedQty: 28, countedQty: null },
    { id: 10, sapCode: '30007777', name: 'Segregator A4 niebieski', category: 'Biuro', expectedQty: 75, countedQty: null },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inventoryData, setInventoryData] = useState({});
  const [inventoryHistory, setInventoryHistory] = useState({});
  const [isAdminView, setIsAdminView] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const searchInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const pinInputRef = useRef(null);

  const ADMIN_PIN = '1234';

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.sapCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (showPinModal && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [showPinModal]);

  const countedProducts = Object.keys(inventoryData).length;
  const totalProducts = products.length;

  const handleAdminToggle = () => {
    if (isAdminView) {
      setIsAdminView(false);
    } else {
      setShowPinModal(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminView(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handlePinKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    } else if (e.key === 'Escape') {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPinInput('');
    setPinError(false);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setInputValue(inventoryData[product.id]?.toString() || '');
  };

  const handleQuantitySubmit = (isAddition = false) => {
    if (selectedProduct && inputValue !== '') {
      const quantity = parseInt(inputValue);
      if (!isNaN(quantity) && quantity >= 0) {
        const timestamp = Date.now();
        
        if (isAddition) {
          setInventoryHistory(prev => ({
            ...prev,
            [selectedProduct.id]: [
              ...(prev[selectedProduct.id] || []),
              { id: timestamp, quantity, timestamp, location: `Lokalizacja ${ (prev[selectedProduct.id]?.length || 0) + 1 } ` }
            ]
          }));
          
          setInventoryData(prev => ({
            ...prev,
            [selectedProduct.id]: (prev[selectedProduct.id] || 0) + quantity
          }));
        } else {
          setInventoryHistory(prev => ({
            ...prev,
            [selectedProduct.id]: [
              { id: timestamp, quantity, timestamp, location: 'Lokalizacja 1' }
            ]
          }));
          
          setInventoryData(prev => ({
            ...prev,
            [selectedProduct.id]: quantity
          }));
        }
        
        setSelectedProduct(null);
        setInputValue('');
        setSearchTerm('');
        
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedProduct) {
        handleQuantitySubmit(false);
      } else if (filteredProducts.length === 1) {
        handleProductSelect(filteredProducts[0]);
      }
    }
  };

  const updateHistoryEntry = (productId, entryId, newQuantity) => {
    if (newQuantity < 0) return;
    
    setInventoryHistory(prev => {
      const productHistory = prev[productId] || [];
      const updatedHistory = productHistory.map(entry => 
        entry.id === entryId ? { ...entry, quantity: newQuantity } : entry
      );
      
      const totalQuantity = updatedHistory.reduce((sum, entry) => sum + entry.quantity, 0);
      setInventoryData(prevData => ({
        ...prevData,
        [productId]: totalQuantity
      }));
      
      return {
        ...prev,
        [productId]: updatedHistory
      };
    });
  };

  const deleteHistoryEntry = (productId, entryId) => {
    setInventoryHistory(prev => {
      const productHistory = prev[productId] || [];
      const updatedHistory = productHistory.filter(entry => entry.id !== entryId);
      
      if (updatedHistory.length === 0) {
        setInventoryData(prevData => {
          const newData = { ...prevData };
          delete newData[productId];
          return newData;
        });
        
        const newHistory = { ...prev };
        delete newHistory[productId];
        return newHistory;
      } else {
        const totalQuantity = updatedHistory.reduce((sum, entry) => sum + entry.quantity, 0);
        setInventoryData(prevData => ({
          ...prevData,
          [productId]: totalQuantity
        }));
        
        return {
          ...prev,
          [productId]: updatedHistory
        };
      }
    });
  };

  const resetProduct = (productId) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      delete newData[productId];
      return newData;
    });
    setInventoryHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[productId];
      return newHistory;
    });
  };

  const getProductStatus = (product) => {
    const counted = inventoryData[product.id];
    if (counted === undefined) return 'pending';
    if (!isAdminView) return 'counted';
    if (counted === product.expectedQty) return 'match';
    return 'diff';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600 text-2xl">📦</span>
              Inwentaryzacja
              {isAdminView && <span className="text-lg text-orange-600">(Administrator)</span>}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleAdminToggle}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm">{isAdminView ? '👁️' : '⚙️'}</span>
                {isAdminView ? 'Widok zliczającego' : 'Panel administratora'}
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {isAdminView ? 'Postęp inwentaryzacji' : 'Pozycje ze wpisami'}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {countedProducts}{isAdminView ? `/ ${ totalProducts } ` : ''}
                </div>
              </div>
            </div>
          </div>
          
          {isAdminView && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${ (countedProducts / totalProducts) * 100 }% ` }}
              ></div>
            </div>
          )}
        </div>

        {isAdminView ? (
          <AdminView 
            products={products}
            inventoryData={inventoryData}
            inventoryHistory={inventoryHistory}
            getProductStatus={getProductStatus}
          />
        ) : (
          <>
            {!selectedProduct ? (
              <CounterSearchView 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredProducts={filteredProducts}
                inventoryData={inventoryData}
                inventoryHistory={inventoryHistory}
                getProductStatus={getProductStatus}
                handleProductSelect={handleProductSelect}
                handleKeyPress={handleKeyPress}
                searchInputRef={searchInputRef}
                isAdminView={isAdminView}
              />
            ) : (
              <CounterInputView 
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                inputValue={inputValue}
                setInputValue={setInputValue}
                inventoryData={inventoryData}
                inventoryHistory={inventoryHistory}
                handleQuantitySubmit={handleQuantitySubmit}
                handleKeyPress={handleKeyPress}
                updateHistoryEntry={updateHistoryEntry}
                deleteHistoryEntry={deleteHistoryEntry}
                quantityInputRef={quantityInputRef}
                isAdminView={isAdminView}
              />
            )}

            {countedProducts > 0 && (
              <QuickStats 
                products={products}
                inventoryData={inventoryData}
                resetProduct={resetProduct}
              />
            )}
          </>
        )}

        {showPinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Dostęp do panelu administratora
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Wprowadź PIN aby uzyskać dostęp do panelu administratora
              </p>
              
              <div className="mb-4">
                <input
                  ref={pinInputRef}
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  onKeyPress={handlePinKeyPress}
                  className={`w - full px - 4 py - 3 text - 2xl text - center border rounded - lg focus: ring - 2 focus: ring - blue - 500 focus: border - transparent font - mono tracking - widest ${
  pinError ? 'border-red-500 bg-red-50' : 'border-gray-300'
} `}
                  placeholder="• • • •"
                  maxLength="4"
                  autoComplete="off"
                />
                {pinError && (
                  <p className="text-red-600 text-sm mt-2 text-center">
                    Nieprawidłowy PIN. Spróbuj ponownie.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closePinModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Potwierdź
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Naciśnij Enter aby potwierdzić lub Escape aby anulować
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CounterSearchView = ({ 
  searchTerm, setSearchTerm, filteredProducts, inventoryData, inventoryHistory, 
  getProductStatus, handleProductSelect, handleKeyPress, searchInputRef, isAdminView 
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wyszukaj produkt (kod SAP lub nazwa)
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Wprowadź 8-cyfrowy kod SAP lub nazwę produktu..."
          autoFocus
        />
      </div>
    </div>

    <div className="space-y-2">
      {filteredProducts.map((product) => {
        const status = getProductStatus(product);
        const counted = inventoryData[product.id];
        
        return (
          <div
            key={product.id}
            onClick={() => handleProductSelect(product)}
            className={`p - 4 border rounded - lg cursor - pointer transition - all hover: shadow - md ${
  status === 'pending' ? 'border-gray-200 hover:border-blue-300' :
    status === 'counted' ? 'border-blue-200 bg-blue-50' :
      status === 'match' ? 'border-green-200 bg-green-50' :
        'border-yellow-200 bg-yellow-50'
} `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {product.sapCode}
                  </span>
                  <span className="text-lg">
                    {status === 'pending' && '⚠️'}
                    {status === 'counted' && '✅'}
                    {status === 'match' && '✅'}
                    {status === 'diff' && '⚠️'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>
              <div className="text-right">
                {!isAdminView && counted !== undefined && (
                  <div className="text-sm font-semibold text-blue-600">
                    Zliczone: {counted}
                    {inventoryHistory[product.id] && inventoryHistory[product.id].length > 1 && (
                      <span className="text-xs ml-1">({inventoryHistory[product.id].length} wpisów)</span>
                    )}
                  </div>
                )}
                {isAdminView && (
                  <>
                    <div className="text-sm text-gray-600">Oczekiwane: {product.expectedQty}</div>
                    {counted !== undefined && (
                      <div className={`text - sm font - semibold ${
  status === 'match' ? 'text-green-600' : 'text-yellow-600'
} `}>
                        Zliczone: {counted}
                        {inventoryHistory[product.id] && inventoryHistory[product.id].length > 1 && (
                          <span className="text-xs ml-1">({inventoryHistory[product.id].length} wpisów)</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {filteredProducts.length === 0 && searchTerm && (
      <div className="text-center py-8 text-gray-500">
        Nie znaleziono produktów pasujących do "{searchTerm}"
      </div>
    )}
  </div>
);

const CounterInputView = ({ 
  selectedProduct, setSelectedProduct, inputValue, setInputValue, inventoryData, 
  inventoryHistory, handleQuantitySubmit, handleKeyPress, updateHistoryEntry, 
  deleteHistoryEntry, quantityInputRef, isAdminView 
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="mb-6">
      <button
        onClick={() => setSelectedProduct(null)}
        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
      >
        ← Powrót do wyszukiwania
      </button>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm bg-white px-2 py-1 rounded">
            {selectedProduct.sapCode}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
        <p className="text-gray-600">{selectedProduct.category}</p>
        <div className="flex items-center justify-between mt-3">
          {isAdminView && (
            <p className="text-sm text-gray-600">
              Oczekiwana ilość: <span className="font-semibold">{selectedProduct.expectedQty}</span>
            </p>
          )}
          {inventoryData[selectedProduct.id] !== undefined && (
            <div className="text-sm text-blue-700 bg-white px-2 py-1 rounded">
              Dotychczas zliczone: <span className="font-bold">{inventoryData[selectedProduct.id]}</span>
              {inventoryHistory[selectedProduct.id] && inventoryHistory[selectedProduct.id].length > 1 && (
                <span className="text-xs ml-1">({inventoryHistory[selectedProduct.id].length} wpisów)</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {inventoryData[selectedProduct.id] !== undefined 
          ? 'Wprowadź dodatkową ilość (z innej lokalizacji)' 
          : 'Wprowadź zliczoną ilość'
        }
      </label>
      <input
        ref={quantityInputRef}
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full px-4 py-4 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="0"
        min="0"
      />
    </div>

    <div className="grid grid-cols-1 gap-3">
      {inventoryData[selectedProduct.id] !== undefined ? (
        <>
          <button
            onClick={() => handleQuantitySubmit(true)}
            disabled={inputValue === ''}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span>+ Dodaj do dotychczasowej ilości</span>
          </button>
          <button
            onClick={() => handleQuantitySubmit(false)}
            disabled={inputValue === ''}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Zastąp całkowitą ilość
          </button>
        </>
      ) : (
        <button
          onClick={() => handleQuantitySubmit(false)}
          disabled={inputValue === ''}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Zapisz ilość
        </button>
      )}
      
      <button
        onClick={() => {
          setInputValue('');
          quantityInputRef.current?.focus();
        }}
        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Wyczyść
      </button>
    </div>

    {inventoryHistory[selectedProduct.id] && inventoryHistory[selectedProduct.id].length > 0 && (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>📋</span>
          Historia wpisów ({inventoryHistory[selectedProduct.id].length})
        </h4>
        <div className="space-y-2">
          {inventoryHistory[selectedProduct.id].map((entry, index) => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              index={index}
              onUpdate={(newQuantity) => updateHistoryEntry(selectedProduct.id, entry.id, newQuantity)}
              onDelete={() => deleteHistoryEntry(selectedProduct.id, entry.id)}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

const AdminView = ({ products, inventoryData, inventoryHistory, getProductStatus }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const filteredAndSortedProducts = products
    .filter(product => {
      if (filterStatus === 'all') return true;
      const status = getProductStatus(product);
      return status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sapCode':
          return a.sapCode.localeCompare(b.sapCode);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'difference':
          const aDiff = Math.abs((inventoryData[a.id] || 0) - a.expectedQty);
          const bDiff = Math.abs((inventoryData[b.id] || 0) - b.expectedQty);
          return bDiff - aDiff;
        default:
          return 0;
      }
    });

  const countByStatus = {
    pending: products.filter(p => getProductStatus(p) === 'pending').length,
    match: products.filter(p => getProductStatus(p) === 'match').length,
    diff: products.filter(p => getProductStatus(p) === 'diff').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{Object.keys(inventoryData).length}</div>
          <div className="text-sm text-gray-600">Pozycje zliczone</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{countByStatus.pending}</div>
          <div className="text-sm text-gray-600">Pozostało do zliczenia</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{countByStatus.match}</div>
          <div className="text-sm text-gray-600">Zgodne z oczekiwanymi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{countByStatus.diff}</div>
          <div className="text-sm text-gray-600">Różnice w ilościach</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtruj status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">Wszystkie</option>
              <option value="pending">Niepoliczony</option>
              <option value="match">Zgodny</option>
              <option value="diff">Różnica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortuj według:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="name">Nazwa</option>
              <option value="sapCode">Kod SAP</option>
              <option value="category">Kategoria</option>
              <option value="difference">Największa różnica</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kod SAP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nazwa produktu</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kategoria</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Oczekiwane</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Zliczone</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Różnica</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Wpisy</th>
              </tr>
            </thead>
<tbody className="divide-y divide-gray-200">
              {filteredAndSortedProducts.map((product) => {
                const status = getProductStatus(product);
                const counted = inventoryData[product.id] || 0;
                const difference = counted - product.expectedQty;
                const entries = inventoryHistory[product.id] || [];
                
                return (
                  <tr key={product.id} className={
                    status === 'match' ? 'bg-green-50' :
                    status === 'diff' ? 'bg-yellow-50' : ''
                  }>
                    <td className="px-4 py-3 font-mono text-sm">{product.sapCode}</td>
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-center text-sm">{product.expectedQty}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">
                      {status === 'pending' ? '-' : counted}
                    </td>
                    <td className={`px - 4 py - 3 text - center text - sm font - semibold ${
  difference > 0 ? 'text-red-600' :
    difference < 0 ? 'text-blue-600' : 'text-green-600'
} `}>
                      {status === 'pending' ? '-' : 
                       difference > 0 ? `+ ${ difference } ` : difference}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg">
                        {status === 'pending' && '⚪'}
                        {status === 'match' && '✅'}
                        {status === 'diff' && '⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {entries.length > 0 ? (
                        <span className="text-blue-600 font-medium">{entries.length}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const QuickStats = ({ products, inventoryData, resetProduct }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
    <h3 className="text-lg font-semibold mb-4">Ostatnio zliczone</h3>
    <div className="space-y-2">
      {products
        .filter(p => inventoryData[p.id] !== undefined)
        .slice(-5)
        .map(product => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-mono text-sm mr-2">{product.sapCode}</span>
              <span className="text-sm">{product.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{inventoryData[product.id]}</span>
              <button
                onClick={() => resetProduct(product.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Resetuj ilość"
              >
                <span className="text-sm">🔄</span>
              </button>
            </div>
          </div>
        ))}
    </div>
  </div>
);

const HistoryEntry = ({ entry, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(entry.quantity.toString());
  const editInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newQuantity = parseInt(editValue);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onUpdate(newQuantity);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(entry.quantity.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 min-w-0">
          #{index + 1} · {formatTime(entry.timestamp)}
        </span>
        <span className="text-sm text-gray-600">{entry.location}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              ref={editInputRef}
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition-colors"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-900 min-w-0">{entry.quantity}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edytuj ilość"
            >
              <span className="text-sm">✏️</span>
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Usuń wpis"
            >
              <span className="text-sm">🗑️</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<InventoryApp />);