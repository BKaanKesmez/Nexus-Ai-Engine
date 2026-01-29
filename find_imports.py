#!/usr/bin/env python3
import pkgutil
import importlib

# Try direct imports first
attempts = [
    "langchain.chains.retrieval",
    "langchain_core.runnables",
    "langchain_community.chains",
]

for module_name in attempts:
    try:
        mod = importlib.import_module(module_name)
        if hasattr(mod, 'create_retrieval_chain'):
            print(f"✓ create_retrieval_chain found in {module_name}")
        if hasattr(mod, 'create_stuff_documents_chain'):
            print(f"✓ create_stuff_documents_chain found in {module_name}")
    except Exception as e:
        print(f"✗ {module_name}: {e}")

# Search in langchain_core
print("\n--- Searching in langchain_core ---")
try:
    import langchain_core
    for importer, modname, ispkg in pkgutil.walk_packages(
        path=langchain_core.__path__,
        prefix=langchain_core.__name__+'.',
        onerror=lambda x: None):
        try:
            mod = importlib.import_module(modname)
            if hasattr(mod, 'create_retrieval_chain'):
                print(f"Found create_retrieval_chain in {modname}")
            if hasattr(mod, 'create_stuff_documents_chain'):
                print(f"Found create_stuff_documents_chain in {modname}")
        except:
            pass
except Exception as e:
    print(f"Error searching langchain_core: {e}")

# Search in langchain_community
print("\n--- Searching in langchain_community ---")
try:
    import langchain_community
    for importer, modname, ispkg in pkgutil.walk_packages(
        path=langchain_community.__path__,
        prefix=langchain_community.__name__+'.',
        onerror=lambda x: None):
        try:
            mod = importlib.import_module(modname)
            if hasattr(mod, 'create_retrieval_chain'):
                print(f"Found create_retrieval_chain in {modname}")
            if hasattr(mod, 'create_stuff_documents_chain'):
                print(f"Found create_stuff_documents_chain in {modname}")
        except:
            pass
except Exception as e:
    print(f"Error searching langchain_community: {e}")
