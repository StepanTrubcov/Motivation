import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import styles from "./WinterArc.module.css";

const ModalWindow = ({ isModalOpen, closeModal }) => {
  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeModal}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.closeButton} aria-label="Close modal">
              <X size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindow;