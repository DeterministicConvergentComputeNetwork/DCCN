"""Setup configuration for DCCN Python package."""

from setuptools import setup, find_packages
from pathlib import Path

# Read the contents of README file
here = Path(__file__).parent.resolve()
long_description = (here.parent / "README.md").read_text(encoding="utf-8")

setup(
    name="dccn",
    version="0.1.0",
    author="James Chapman",
    author_email="xhecarpenxer@gmail.com",
    description="Deterministic Convergent Compute Network",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/DCCN",
    project_urls={
        "Bug Tracker": "https://github.com/yourusername/DCCN/issues",
        "Documentation": "https://github.com/yourusername/DCCN/wiki",
        "Source Code": "https://github.com/yourusername/DCCN",
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering",
        "License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.9",
    install_requires=[
        # Core dependencies
        "typing-extensions>=4.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
            "black>=22.0",
            "flake8>=5.0",
            "mypy>=0.990",
            "sphinx>=5.0",
            "sphinx-rtd-theme>=1.0",
            "sphinx-autodoc-typehints>=1.19",
        ],
        "test": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
        ],
        "docs": [
            "sphinx>=5.0",
            "sphinx-rtd-theme>=1.0",
            "sphinx-autodoc-typehints>=1.19",
        ],
    },
    entry_points={
        "console_scripts": [
            "dccn=dccn.cli:main",
        ],
    },
    license="GPL-3.0-or-later",
    keywords="deterministic hashing event-sourcing distributed-systems",
)
